const db = require("../db");

async function all() {
  return db.select().from("events");
}

async function upcoming() {
  //.where('createdAt', '>=', '2009-01-01T00:00:00Z')
  return db.select().from("events").where('start_time', '>=', new Date());
}

async function trail() {
  return db.select().from("events").where({category: '新人介绍课程'}).limit(1);
}

async function join(event_id, user_id) {
  const insertQuery = db("user_event")
    .insert({
      user_id,
      event_id
    });
  return db.raw(`? ON CONFLICT DO NOTHING`, insertQuery);
}

async function unjoin(event_id, user_id) {
  return db("user_event")
    .where({
      user_id,
      event_id
    })
    .del();
}

async function find(event_id, params = {}) {
  const events = await db("events").where({id: event_id});

  if(events && events.length > 0) {
    const event = events[0];
    if(params.includeAttendees) {
      const eventAttendees = await attendees(event.id);
      Object.assign(event, {attendees: eventAttendees});
    }
    return event;
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
  all,
  upcoming,
  join,
  unjoin,
  find,
  attendees,
  trail,
};
