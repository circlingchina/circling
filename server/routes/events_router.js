const _ = require('lodash');
const passport = require('passport');
const debug = require("debug")("server-debug");
const Event = require('../models/Event');
const UserModel = require('../models/UserModel');
const moment = require('moment');

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

  if (event && event.attendees.length >= event.max_attendees) {
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
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'invalid user id',
        error_code: 40032,
        message: 'Insufficient privileges'
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
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      is_last_page: true,
      events: [
        {
          id: "916304e0-11a2-4c96-9155-e253c56b0c07",
          name: "测试活动01",
          max_attendees: 3,
          category: "Circling",
          host: "测试带领",
          event_link: "https://meeting.zhumu.me/j/135811509",
          start_time: moment(new Date()).add(-11, 'h').toDate(),
          end_time: moment(new Date()).add(-10, 'h').toDate(),
          details: "",
          fields: {},
          attendees: [
            {
              id: "12b6ee97-d0a7-4759-a2de-3d66a5ee152a",
              name: "circling-test-01"
            },
            {
              id: "3584d160-4d2a-4b40-a00f-e509cd4b4a0c",
              name: "circling-test-02"
            },
          ]
        },
        {
          id: "916304e0-11a2-4c96-9155-e253c56b0c06",
          name: "测试活动02",
          max_attendees: 3,
          category: "社群活动",
          host: "测试带领",
          event_link: "https://meeting.zhumu.me/j/135811509",
          start_time: moment(new Date()).add(-21, 'h').toDate(),
          end_time: moment(new Date()).add(-20, 'h').toDate(),
          details: "",
          fields: {},
          attendees: [
            {
              id: "12b6ee97-d0a7-4759-a2de-3d66a5ee152a",
              name: "circling-test-01"
            },
            {
              id: "3584d160-4d2a-4b40-a00f-e509cd4b4a0c",
              name: "circling-test-02"
            },
          ]
        }
      ]
    }));
};

const attended = async (req, res) => {
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      events: [
        {
          id: "473ca989-6f96-40ba-84d3-0a01ec56730a",
          name: "测试活动03",
          max_attendees: 3,
          category: "Circling",
          host: "测试带领",
          event_link: "https://meeting.zhumu.me/j/135811509",
          start_time: moment(new Date()).add(15, 'h').toDate(),
          end_time: moment(new Date()).add(16, 'h').toDate(),
          details: "",
          fields: {},
          attendees: [
            {
              id: "12b6ee97-d0a7-4759-a2de-3d66a5ee152a",
              name: "circling-test-01"
            },
            {
              id: "3584d160-4d2a-4b40-a00f-e509cd4b4a0c",
              name: "circling-test-02"
            },
          ]
        },
        {
          id: "473ca989-6f96-40ba-84d3-0a01ec56730b",
          name: "测试活动04",
          max_attendees: 3,
          category: "社群活动",
          host: "测试带领",
          event_link: "https://meeting.zhumu.me/j/135811509",
          start_time: moment(new Date()).add(5, 'h').toDate(),
          end_time: moment(new Date()).add(6, 'h').toDate(),
          details: "",
          fields: {},
          attendees: [
            {
              id: "12b6ee97-d0a7-4759-a2de-3d66a5ee152a",
              name: "circling-test-01"
            },
            {
              id: "3584d160-4d2a-4b40-a00f-e509cd4b4a0c",
              name: "circling-test-02"
            },
          ]
        }
      ]
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
