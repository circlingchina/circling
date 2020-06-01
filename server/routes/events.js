const debug = require("debug")("test");
const db = require("../db");

const all = async (req, res) => {
  const events = await db('events').limit(5);
  for (const event of events) {
    debug("event.id", event.id);
    const users = await db('user_event')
      .leftJoin('users', 'users.id', '=', 'user_event.user_id').where({
        event_id: event.id
      });
    debug("users", users);
    Object.assign(event, {users: users});
  }
  res
    .type('json')
    .end(JSON.stringify({events: events}));
};

const join = async (req, res) => {
  const user_id = req.query.userId;
  const event_id = req.params.id;
  const insertRes = await db("user_event").insert({
    user_id,
    event_id
  });

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