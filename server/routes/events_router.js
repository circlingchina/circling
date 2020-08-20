const _ = require('lodash');

const debug = require("debug")("server-debug");
const Event = require('../models/Event');
const UserModel = require('../models/UserModel');

require('dotenv').config();

const eventWithExtraFields = async(event) => {
  if (!_.isEmpty(event.fields)) {
    const fieldsObj = event.fields;
    if (fieldsObj.offline_event_contact) {
      fieldsObj.offline_event_contact = await UserModel.find(fieldsObj.offline_event_contact);
    }
    Object.assign(event, {fields: fieldsObj});
  }
  return event;
};

const upcoming = async (req, res) => {
  try {
    const events = await Event.upcoming();

    for (const event of events) {
      const attendees = await Event.attendees(event.id);
      Object.assign(event, {attendees});

      // Convert fields to properties
      await eventWithExtraFields(event);
    }

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
  
  if (event && event.attendees.length >= event.max_attendees) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'event is full'
      }));
    return;
  }
  
  const canJoin = await UserModel.canJoin(userId, eventId);
  if (!canJoin) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'invalid user id'
      }));
    return;
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


module.exports = (app) => {
  app.get('/events/:id/join', join);
  app.get('/events/:id/unjoin', unjoin);
  app.get('/events', upcoming);
  app.get('/events/nextTrail', nextTrail);
};
