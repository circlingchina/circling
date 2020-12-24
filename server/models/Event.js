const moment = require('moment');
const db = require("../db");
const _ = require("lodash");
const { isBeforeAFutureTimeFromNow } = require('../utils/timeUtils');

async function all() {
  return db.select().from("events").orderBy("start_time");
}

function isInJoinableTimeFrame(event) {
  return isBeforeAFutureTimeFromNow(event.start_time, 2, 'days', true);
}

async function upcoming() {
  //.where('createdAt', '>=', '2009-01-01T00:00:00Z')
  const now = new Date();
  const offsetMins = -30;

  return db.select().from("events").where('start_time', '>=', moment(now).add(offsetMins, 'm').toDate())
    .orderBy("start_time");
}

async function nextTrail() {
  const now = new Date();

  const events = await db.select().from('events')
    .where('category', '新人介绍课程')
    .andWhere('start_time', '>=', now)
    .orderBy("start_time");

  // ALERT! N+1 queries, improve improve it later.
  /* equivalent query::
  select
  events.id,
  events.name,
  events.max_attendees,
  count(user_event.user_id) as attendee_count,
  events.start_time
  from events
  left join user_event on user_event.event_id = events.id
  where events.category = '新人介绍课程' and events.start_time > '2020-07-01'
  group by events.id
  having events.max_attendees > count(user_event.user_id)
  order by events.start_time
  limit 1
  */
  for (const event of events) {

    const result = await db.count().from('user_event').where({event_id: event.id});
    const count = _.toNumber(result[0]['count']);

    // console.log('event.max_attendees', event.max_attendees);
    // console.log('count', count);
    if (count < event.max_attendees) {
      return [event];
    }
  }
  return [];
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
  return db
    .select('id','email','name')
    .from('user_event')
    .leftJoin('users', 'users.id', '=', 'user_event.user_id')
    .where({
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
  nextTrail,

  // utility functions
  isInJoinableTimeFrame,
};
