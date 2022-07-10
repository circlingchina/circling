const debug = require("debug")("email");
const db = require("../db");
const EventModel = require('./Event');
const {sentFirstEventEmail} = require('../emailService');
const { readableTimeString } = require('../utils/timeUtils');
const moment = require('moment');
const _ = require('lodash');
const {sha512, saltHashPassword} = require('../utils/cryptoUtils');

const { DataSync } = require("aws-sdk");


const PAYMENT_PRODUCTS = {
  SINGLE_EVENT: {
    premiumLevel: '0',
    daysDelta: 0,
  },
  MONTHLY: {
    premiumLevel: '2',
    daysDelta: 31,
  },
  // have changed this to SEASON -> 3 months
  HALF_YEAR: {
    premiumLevel: '3',
    daysDelta: 92,
  },
  VIP: {
    premiumLevel: '4',
    daysDelta: 365 * 5 + 1,
  },
};

async function handleFirstJoinEmail(id, event_id) {
  debug("handling email stuff for user_id=", id);
  const user = await db("users").where({id}).limit(1).then((res)=>res[0]);
  debug({user});
  const event = await db("events").where({id: event_id}).limit(1).then((res)=>res[0]);
  debug({event});

  let sentMessageId = null;

  if (user && event && user.sent_first_event_email < 1) {
    const data = await sentFirstEventEmail(user.name, user.email, event.name, readableTimeString(event.start_time));
    sentMessageId = data.MessageId;
    debug({data, sentMessageId});
  }

  // update sent_first_event_email state
  if(sentMessageId) {
    await db("users").where({id}).update({sent_first_event_email: user.sent_first_event_email+1});
  }
}

// Find user by id
async function find(id) {
  const users = await db("users").where({id});
  if (users && users.length > 0) {
    return users[0];
  }
  return null;
}

// Find user by email (distinct field)
async function findByEmail(email) {
  const users = await db("users").where({email});
  if (users && users.length > 0) {
    return users[0];
  }
  return null;
}

async function create(name, email, password) {
  const passInfo = saltHashPassword(password);
  return createPwdDigest(name, email, passInfo.salt, passInfo.hexdigest);
}

async function createPwdDigest(name, email, salt, password_hexdigest) {
  const userParams = { name, email, salt, password_hexdigest };

  const query = db.raw(
    `? ON CONFLICT (email) DO NOTHING RETURNING id;`,
    [db("users").insert(userParams)],
  );
  const result = await query;
  let id = null;
  if(result.rowCount > 0) {
    id = result.rows[0].id;
  }
  return id;
}

async function changePassword(userId, password) {
  const passInfo = saltHashPassword(password);
  const params = {
    salt: passInfo.salt,
    password_hexdigest: passInfo.hexdigest,
  };
  const id = await db("users").where({id: userId}).update(params).returning("id");
  return id;
}

function verifyPassword(user, password) {
  return _.isEqual(sha512(password, user.salt).hexdigest, user.password_hexdigest);
}

// Lazy check if user is expired or not. If so, don't allow user to join the event and set the premium_level to 0
async function _checkExpired(user) {
  const isExpired = moment().tz('Asia/Shanghai').isAfter(user.premium_expired_at);
  if (isExpired) {
    await db("users")
      .where({ id: user.id })
      .update({ premium_level: 0 });
    return false;
  }
  return true;
}

async function canJoin(user_id, event_id) {
  // sanity check
  const user = await find(user_id);
  if (!user) {
    return false;
  }
  const event = await EventModel.find(event_id);
  if (!event) {
    return false;
  }

  // No restrictions for trail events
  if (event.category === '新人介绍课程') {
    return true;
  }

  // For premium_level 0, event_credit > 0 is required
  if (user.premium_level === '0') {
    return user.event_credit > 0 && event.category === 'Circling';
  }

  // For premium_level 2,3,4, the start time of event must before user's premium expire date
  if (parseInt(user.premium_level, 10) > 1) {
    // if the user has been expired, decrease the premium level and return false
    if (!_checkExpired(user)) {
      return false;
    }

    return moment(user.premium_expired_at).isAfter(event.start_time);
  }

  // safe guard
  return false;
}

async function enablePremium(userId, category) {
  const user = await find(userId);

  const premiumLevel = _.get(PAYMENT_PRODUCTS, category + '.premiumLevel', '0');
  const daysDelta = _.get(PAYMENT_PRODUCTS, category + '.daysDelta', 0);

  const premiumLevelToUpdate = Math.max(
    parseInt(premiumLevel),
    parseInt(user.premium_level)
  ).toString();

  let momentToUpdate = moment.max(
    moment(),
    moment(user.premium_expired_at, 'YYYY-MM-DD')
  ).add(daysDelta, 'days').format('YYYY-MM-DD');

  let operation = db("users")
    .where({ id: userId })
    .update({
      premium_level: premiumLevelToUpdate,
      premium_expired_at: momentToUpdate
    });

  if (category === 'SINGLE_EVENT') {
    operation = operation.increment('event_credit', 1);
  }

  await operation;
}

/**
 * After join hook, decrease event_credit after a non-premium user joined an event
 * @param userId
 */
async function afterJoin(userId) {
  const user = await find(userId);
  if (user && user.premium_level === '0') {
    await db("users")
      .where({ id: userId })
      .decrement('event_credit', 1);
  }
}

/**
 * After un-join hook, increase event_credit after a non-premium user un-joined an event
 * @param userId
 */
async function afterUnjoin(userId) {
  const user = await find(userId);
  if (user && user.premium_level === '0') {
    await db("users")
      .where({ id: userId })
      .increment('event_credit', 1);
  }
}

async function findPasswordResetByUserId(userId) {
  const records = await db("password_reset").where({user_id: userId});
  if (records && records.length > 0) {
    return records[0];
  }
  return null;
}

async function findPasswordReset(id) {
  const records = await db("password_reset").where({id});
  if (records && records.length > 0) {
    return records[0];
  }
  return null;
}

// Delete the password reset record by user_id, return the deleted record count (1 or 0)
async function deleteFindPasswordReset(userId) {
  const deleted = await db("password_reset").where({user_id: userId}).del();
  return deleted;
}

async function createPasswordReset(user_id) {
  await deleteFindPasswordReset(user_id);

  const records = await db("password_reset").insert({user_id}).returning("id");

  if (records.length > 0) {
    return records[0];
  }
  return null;
}


// precreate_users ============================
async function findPrecreateUser(id) {
  const records = await db("precreate_users").where({id});
  if (records && records.length > 0) {
    return records[0];
  }
  return null;
}

async function findPrecreateUserByEmail(email) {
  const records = await db("precreate_users").where({email});
  if (records && records.length > 0) {
    return records[0];
  }
  return null;
}

async function deletePrecreateUserByEmail(email) {
  const deleted = await db("precreate_users").where({email}).del();
  return deleted;
}

async function deletePrecreateUser(id) {
  const deleted = await db("precreate_users").where({id}).del();
  return deleted;
}

async function createPrecreateUser(name, email, password) {
  // Return null if the email has already registered
  const existingUser = await findByEmail(email);
  if (existingUser) {
    return null;
  }

  await deletePrecreateUserByEmail(email);
  const passwordInfo = saltHashPassword(password);
  const records = await db("precreate_users")
    .insert({
      name,
      email,
      salt: passwordInfo.salt,
      password_hexdigest: passwordInfo.hexdigest,
    })
    .returning("id");

  if (records.length > 0) {
    return records[0];
  }
  return null;
}

module.exports = {
  handleFirstJoinEmail,
  create,
  createPwdDigest,
  find,
  findByEmail,
  changePassword,
  verifyPassword,
  canJoin,
  enablePremium,
  afterJoin,
  afterUnjoin,

  findPasswordReset,
  findPasswordResetByUserId,
  deleteFindPasswordReset,
  createPasswordReset,

  findPrecreateUser,
  findPrecreateUserByEmail,
  deletePrecreateUserByEmail,
  deletePrecreateUser,
  createPrecreateUser,
};
