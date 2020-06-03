const mountEventsRouter = require('./events_router');
const mountUsersRouter = require('./users_router');

module.exports = (app) => {
  mountEventsRouter(app);
  mountUsersRouter(app);
};