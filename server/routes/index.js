const mountEventsRouter = require('./events_router');

module.exports = (app) => {
  mountEventsRouter(app);
};