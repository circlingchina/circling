const db = require("./db");
const moment = require('moment');
const {saltHashPassword} = require('./utils/cryptoUtils');

const createTestEvent =  async function(name="Test Event", start_time = new Date(), category='Circling', max_attendees=10) {
  return db("events").returning('id').insert({
    name: name,
    host: "tester",
    start_time,
    category,
    max_attendees
  }).then(ids=>ids[0]);
};

exports.createTestUser = async function(name="Alice") {
  const password_info = saltHashPassword('password');

  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`,
    salt: password_info.salt,
    password_hexdigest: password_info.hexdigest,
  }).then(ids=>ids[0]);
};

exports.createTestUserWithEventCredit = async function(name="Alice", event_credit = 1) {
  const password_info = saltHashPassword('password');
  return db("users").returning('id').insert({
    name,
    event_credit,
    email: `${name}@test.com`,
    salt: password_info.salt,
    password_hexdigest: password_info.hexdigest,
  }).then(ids=>ids[0]);
};

exports.createPremiumUser= async function(name="Alice", premium_level='2', expired=false) {
  let premium_expired_at;

  if (expired) {
    premium_expired_at = moment().add(-2, 'days').format("YYYY-MM-DD");
  } else {
    premium_expired_at = moment().add(2, 'days').format("YYYY-MM-DD");
  }

  const password_info = saltHashPassword('password');

  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`,
    premium_level,
    premium_expired_at,
    salt: password_info.salt,
    password_hexdigest: password_info.hexdigest,
  }).then(ids=>ids[0]);
};

exports.createPastEvent = async function() {
  const past = new Date(new Date().getTime() - 60 * 60 * 1000);
  return createTestEvent("Past Event", past);
};

exports.createUpcomingEvent = async function(date = new Date(new Date().getTime() + 60 * 60 * 1000) ) {
  const future = date;
  return createTestEvent("Future Event", future);
};

exports.createUpcomingNonCirclingEvent = async function(date = new Date(new Date().getTime() + 60 * 60 * 1000) ) {
  const future = date;
  return createTestEvent("Future Non-Circling Event", future, "社群活动");
};

exports.createTrailEvent = async function(name="Trail Event", start_time=new Date()) {
  return createTestEvent(name, start_time, '新人介绍课程');
};

exports.createUserEvent = async function(event_id, user_id) {
  return db("user_event").insert({ event_id, user_id });
};

exports.clearDB = async function() {
  const tables = [
    "events",
    "users",
    "user_charges",
    "user_event",
    "password_reset",
    "precreate_users",
  ];

  for (const table of tables) {
    await db(table).del();
  }
};

exports.createTestEvent = createTestEvent;
