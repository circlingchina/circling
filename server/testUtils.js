const db = require("./db");
const moment = require('moment');

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
  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`
  }).then(ids=>ids[0]);
};


exports.createTestUserWithEventCredit = async function(name="Alice", event_credit = 1) {
  return db("users").returning('id').insert({
    name,
    event_credit,
    email: `${name}@test.com`
  }).then(ids=>ids[0]);
};

exports.createPremiumUser= async function(name="Alice", premium_level='1', expired=false) {
  let premium_expired_at;
  
  if (expired) {
    premium_expired_at = moment().add(-2, 'days').format("YYYY-MM-DD"); 
  } else {
    premium_expired_at = moment().add(2, 'days').format("YYYY-MM-DD"); 
  }
  
  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`,
    premium_level,
    premium_expired_at
  }).then(ids=>ids[0]);
};

exports.createPastEvent = async function() {
  const past = new Date(new Date().getTime() - 60 * 60 * 1000);
  return createTestEvent("Past Event", past);
};

exports.createUpcomingEvent = async function() {
  const future = new Date(new Date().getTime() + 60 * 60 * 1000);
  return createTestEvent("Future Event", future);
};

exports.createTrailEvent = async function(name="Trail Event", start_time=new Date()) {
  return createTestEvent(name, start_time, '新人介绍课程');
};

exports.createUserEvent = async function(event_id, user_id) {
  return db("user_event").insert({ event_id, user_id });
};

exports.clearDB = async function() {
  await db("events").del();
  await db("users").del();
};

exports.createTestEvent = createTestEvent;
