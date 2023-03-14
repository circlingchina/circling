const mountEventsRouter = require('./events_router');
const mountUsersRouter = require('./users_router');
const mountPaymentRouter = require('./payment_router');
const mountAuthRouter = require('./auth_router');
const infoRouter = require('./info_router');
const leaderRouter = require('./leader_router');

module.exports = (app) => {
  mountEventsRouter(app);
  mountUsersRouter(app);
  mountPaymentRouter(app);
  mountAuthRouter(app);
  infoRouter(app);
  leaderRouter(app);
};
