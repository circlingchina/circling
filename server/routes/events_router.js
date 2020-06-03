const debug = require("debug")("server");
const Event = require('../models/Event');

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

const join = async (req, res) => {

  const event_id = req.params.id;
  // const user_id = req.query.user_id;
  const user_id = "9ec43eb7-ec08-4584-b2f1-d5d95f92b9ef"; // HACK
  debug({user_id, event_id});
  
  // HACK 
  const insertRes = await Event.join(event_id, user_id);
  

  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: insertRes,
      event_id: event_id
    }));
};

module.exports = (app) => {
  app.get('/events/:id/join', join);
  app.get('/events', upcoming);
};