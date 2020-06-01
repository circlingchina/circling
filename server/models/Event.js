const debug = require("debug")("test");
const db = require("../db");

async function join(event_id, user_id) {
  const insertQuery = db("user_event").insert({
    user_id,
    event_id
  });
  return db.raw(`? ON CONFLICT DO NOTHING`, insertQuery);
}

async function find(event_id) {
  const events = await db("events").where({id: event_id});

  if(events && events.length > 0) {
    return events[0];
  } 
  return null;
}

async function attendees(event_id) {
  return db('user_event')
    .leftJoin('users', 'users.id', '=', 'user_event.user_id').where({
      event_id
    });
}

module.exports = {
  join,
  find,
  attendees
};