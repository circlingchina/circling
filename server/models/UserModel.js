const debug = require("debug")("email");
const db = require("../db");
const EventModel = require('./Event');
const {sentFirstEventEmail} = require('../emailService');
const readableTimeString = require('../utils/readableTimeString');
const moment = require('moment');
const _ = require('lodash');
const { DataSync } = require("aws-sdk");


const PAYMENT_PRODUCTS = {
  SINGLE_EVENT: {
    premiumLevel: '1',
    daysDelta: 3, 
  },
  MONTHLY: {
    premiumLevel: '2',
    daysDelta: 31, 
  },
  HALF_YEAR: {
    premiumLevel: '3',
    daysDelta: 183, 
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
  const user = await find(user_id);
  
  if (!user || user.premium_level === '0') {
    const event = await EventModel.find(event_id);
    return event && event.category === '新人介绍课程';
  }
  return _checkExpired(user);
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
  
  await db("users")
    .where({ id: userId })
    .update({ 
      premium_level: premiumLevelToUpdate, 
      premium_expired_at: momentToUpdate }
    ); 
} 

module.exports = {
  handleFirstJoinEmail,
  find,
  canJoin,
  enablePremium,
};
