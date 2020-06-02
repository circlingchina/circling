const Event = require('../models/Event');
const all = async (req, res) => {
  const events = await Event.upcoming();
  for (const event of events) {
    const attendees = await Event.attendees(event.id);
    Object.assign(event, {attendees});
  }
  res
    .type('json')
    .end(JSON.stringify({events: events}));
};

const join = async (req, res) => {
  const user_id = req.query.userId;
  const event_id = req.params.id;
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
  app.get('/events', all);
};