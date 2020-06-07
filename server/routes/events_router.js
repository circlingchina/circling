const debug = require("debug")("server-debug");
const Event = require('../models/Event');
const UserModel = require('../models/UserModel');

require('dotenv').config();

const upcoming = async (req, res) => {
  try {
    const events = await Event.upcoming();

    for (const event of events) {
      const attendees = await Event.attendees(event.id);
      Object.assign(event, {attendees});
    }

    res
      .type('json')
      .end(JSON.stringify({events: events}));

  } catch (error) {
    return res.status(500).end();
  }
};

const trail_event = async(req, res) => {
  try {
    const event = await Event.trail();
    res
      .type('json')
      .end(JSON.stringify(event));
  } catch (error) {
    return res.status(500).end();
  }
};

const join = async (req, res) => {

  const event_id = req.params.id;
  const user_id = req.query.user_id;

  const queryRes = await Event.join(event_id, user_id);

  //optionally see if email needs to be sent
  await UserModel.handleFirstJoinEmail(user_id);
  const updatedEvent = await Event.find(event_id, {includeAttendees: true});

  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: queryRes,
      event: updatedEvent
    }));
};

const unjoin = async (req, res) => {

  const event_id = req.params.id;
  const user_id = req.query.user_id;
  debug({user_id, event_id});

  const queryRes = await Event.unjoin(event_id, user_id);
  const updatedEvent = await Event.find(event_id, {includeAttendees: true});
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
  app.get('/events/trail', trail_event);
};
