const events = require ('./events');

module.exports = (app) => {
  app.use('/events', events);
};