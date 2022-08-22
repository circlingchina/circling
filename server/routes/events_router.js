const _ = require('lodash');
const passport = require('passport');
const debug = require("debug")("server-debug");
const Event = require('../models/Event');
const UserModel = require('../models/UserModel');
const moment = require('moment');

const mainLogger = require("../logger");
const NAME = 'router.events';
const logger = mainLogger.child({ label: NAME });

require('dotenv').config();

const eventWithExtraFields = async(event) => {
  if (!_.isEmpty(event.fields)) {
    const fieldsObj = event.fields;
    if (fieldsObj.offline_event_contact) {
      fieldsObj.offline_event_contact = await UserModel.find(fieldsObj.offline_event_contact);
    }
    Object.assign(event, {fields: fieldsObj});
  }

  let isInJoinableTimeFrame = false;
  if (Event.isInJoinableTimeFrame(event)) {
    isInJoinableTimeFrame = true;
  }
  Object.assign(event, { isInJoinableTimeFrame });

  return event;
};

const eventAttendedStatus = async(events, user_id) => {
  if (events && events.length > 0) {
    for (const event of events) {
      const attendees = await Event.attendees(event.id);
      Object.assign(event, {attendees});

      let event_status = 0;
      if (attendees && attendees.length >= event.max_attendees) {
        event_status = 1;
      }
      Object.assign(event, {event_status});
      await eventWithExtraFields(event);

      let attend_status = -1
      if (user_id) {
        const user = await UserModel.find(user_id)
        if (user) {
          attend_status = 0;
          console.log(user)
          console.log(attendees)
          if (attendees && attendees.some(attendee => attendee.id == user.id)) {
            attend_status = 1;
          }
        }
      }
      Object.assign(event, {attend_status});
    }
  }
  return events;
}

const upcoming = async (req, res) => {
  try {
    const user_id = req.query.token;
    const events = await Event.upcoming();
    await eventAttendedStatus(events, user_id);

    res
      .type('json')
      .end(JSON.stringify({events: events}));

  } catch (error) {
    return res.status(500).end();
  }
};

const nextTrail = async(req, res) => {
  try {
    const event = await Event.nextTrail();
    res
      .type('json')
      .end(JSON.stringify(event));
  } catch (error) {
    return res.status(500).end();
  }
};

const join = async (req, res) => {

  const eventId = req.params.id;
  const userId = req.query.user_id;

  const event = await Event.find(eventId, {includeAttendees: true});

  // if (!Event.isInJoinableTimeFrame(event)) {
  //   res
  //     .status(400)
  //     .type('json')
  //     .send(JSON.stringify({
  //       result: false,
  //       err: 'event is unjoinable'
  //     }));
  //   return;
  // }

  if (!event) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'Event not found',
        error_code: 40030,
        message: 'Event not found'
      }));
    return;
  }

  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach(e => {
      if (e.id == userId) {
        res
          .status(400)
          .type('json')
          .send(JSON.stringify({
            error_code: 40030,
            message: 'Already participated'
          }));
        return
      }
    });
  }

  if (event.attendees.length >= event.max_attendees) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'event is full',
        error_code: 40031,
        message: 'Event is full'
      }));
    return;
  }

  const canJoin = await UserModel.canJoin(userId, eventId);
  if (!canJoin) {
    const isTicketUsedUp = await UserModel.isTicketUsedUp(userId, eventId);
    if (isTicketUsedUp) {
      res
        .status(400)
        .type('json')
        .send(JSON.stringify({
          error_code: 40034,
          message: 'No ticket'
        }));
        return
    } else {
      res
        .status(400)
        .type('json')
        .send(JSON.stringify({
          result: false,
          err: 'invalid user id',
          error_code: 40032,
          message: 'Insufficient privileges'
        }));
        return
    }
  }

  const queryRes = await Event.join(eventId, userId);
  await UserModel.afterJoin(userId);

  //optionally see if email needs to be sent
  await UserModel.handleFirstJoinEmail(userId, eventId);
  const updatedEvent = await Event.find(eventId, {includeAttendees: true});
  await eventWithExtraFields(updatedEvent);
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: queryRes,
      event: updatedEvent
    }));
};

const unjoin = async (req, res) => {

  const eventId = req.params.id;
  const userId = req.query.user_id;
  debug({userId, eventId});

  const queryRes = await Event.unjoin(eventId, userId);
  await UserModel.afterUnjoin(userId);
  const updatedEvent = await Event.find(eventId, {includeAttendees: true});
  await eventWithExtraFields(updatedEvent);
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: queryRes,
      event: updatedEvent
    }));
};

const statistics = async (req, res) => {
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      event_num:23,
      circling_num:21,
      companions: 67
    }));
};

const history = async (req, res) => {
  const count = req.count || 10;
  const offset = req.offset || 0
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  const events = await Event.historyByUserId(user_id, count, offset);
  let is_last_page = true
  if (!events) {
    return res.status(200).type('json').send(JSON.stringify({
      events: []
    }));
  }
  if (events.length > count) {
    is_last_page = false
    events.pop()
  }
  await eventAttendedStatus(events, user_id);
  return res.status(200).type('json').send(JSON.stringify({
    events: events
  }));
};

const attended = async (req, res) => {
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  const events = await Event.attendedEventsByUserId(user_id);
  if (!events) {
    return res.status(200).type('json').send(JSON.stringify({
      events: []
    }));
  }
  await eventAttendedStatus(events, user_id);
  return res.status(200).type('json').send(JSON.stringify({
    events: events ? events : []
  }));
};

module.exports = (app) => {
  app.get('/events/:id/join', passport.authenticate('jwt', { session: false }), join);
  app.get('/events/:id/unjoin', passport.authenticate('jwt', { session: false }), unjoin);
  app.get('/events', upcoming);
  app.get('/events/nextTrail', nextTrail);
  app.get('/events/statistics', passport.authenticate('jwt', { session: false }), statistics);
  app.get('/events/history', passport.authenticate('jwt', { session: false }), history);
  app.get('/events/attended', passport.authenticate('jwt', { session: false }), attended);
};
