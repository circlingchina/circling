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

async function subscribe(event_id, user_id, open_id) {
  const insertQuery = db("user_event_subscribe")
  .insert({
    user_id,
    event_id,
    open_id,
    status: 0
  });
return db.raw(`? ON CONFLICT DO NOTHING`, insertQuery);
}

async function unsubscribe(event_id, user_id) {
  return db("user_event_subscribe")
    .where({
      user_id,
      event_id
    })
    .del();
}

async function isSubscribed(event_id, user_id) {
  const subscribes = await db("user_event_subscribe").where({
    user_id,
    event_id
  });
  if (subscribes && subscribes.length > 0) {
    return subscribes.some(sub => sub.status == 0);
  }
  return false;
}

async function getSubscribeUsers(event_id) {
  return await db("user_event_subscribe")
  .where({event_id})
  .andWhere('status', '=', 0);
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

async function eventsLatestAttended(user_id) {
  return db
    .select()
    .from('user_event')
    .leftJoin('events', 'events.id', '=', 'user_event.event_id')
    .where({
      user_id
    })
    .orderBy('create_at', 'desc')
    .limit(1);
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

async function attendedEventsByUserId(user_id) {
  const now = new Date();
  return db
    .select()
    .from('user_event')
    .leftJoin('events', 'events.id', '=', 'user_event.event_id')
    .where({
      user_id
    })
    .where('events.start_time', '>', moment(now))
    .orderBy('events.start_time', 'desc')
}

async function historyByUserId(user_id, count, offset) {
  return db
  .select()
  .from('user_event')
  .leftJoin('events', 'events.id', '=', 'user_event.event_id')
  .where({
    user_id
  })
  .orderBy('events.start_time', 'desc')
  .offset(offset)
  .limit(count+1)
}

async function historyByUserIdAndTime(user_id, start, end) {
  return db
  .select()
  .from('user_event')
  .innerJoin('events', 'user_event.event_id', '=', 'events.id')
  .where({
    user_id
  })
  .andWhere('events.start_time', '>', start)
  .andWhere('events.end_time', '>', end)
}

async function eventCountByUserIdAndTime(user_id, start, end) {
  const events = await historyByUserIdAndTime(user, start, end);
  if (!events || !events.length) return 0;
  return events.length;
}

async function companionCountByUserIdAndTime(user_id, start, end) {
  return 0;
}

async function getStatistics(user_id, start, end) {
  let event_num = 0;
  let circling_num = 0;
  let companions = 0;

  const events = await historyByUserIdAndTime(user_id, start, end);
  if (events && events.length) {
    event_num = events.length;
    circling_num = events.filter(x => x.category == 'Circling').length;
  }
  return {
    event_num,
    circling_num,
    companions
  }
}

module.exports = {
  all,
  upcoming,
  join,
  unjoin,
  subscribe,
  unsubscribe,
  isSubscribed,
  getSubscribeUsers,
  find,
  eventsLatestAttended,
  attendees,
  nextTrail,

  attendedEventsByUserId,
  historyByUserId,

  historyByUserIdAndTime,
  eventCountByUserIdAndTime,
  companionCountByUserIdAndTime,
  getStatistics,

  // utility functions
  isInJoinableTimeFrame,
};
