const db = require("./db");

const createTestEvent =  async function(name="Test Event", start_time = new Date()) {
  return db("events").returning('id').insert({
    name: name, 
    host: "tester",
    start_time,
  }).then(ids=>ids[0]);
};

exports.createTestUser = async function(name="Alice") {
  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`
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

exports.clearDB = async function() {
  await db("events").del();
  await db("users").del();
};

exports.createTestEvent = createTestEvent;