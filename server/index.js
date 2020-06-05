const result =require('dotenv').config();
const debug = require('debug')('server');
if(result.error) {
  throw result.error;
}

const app = require('./app');
const port = process.env.API_PORT || 4567;

app.listen(port, () => {
  debug(`Running on port ${port}`);
});

module.exports = app;