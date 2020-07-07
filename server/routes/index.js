const mountEventsRouter = require('./events_router');
const mountUsersRouter = require('./users_router');
const mountPaymentRouter = require('./payment_router');

module.exports = (app) => {
  mountEventsRouter(app);
  mountUsersRouter(app);
  mountPaymentRouter(app);
};
