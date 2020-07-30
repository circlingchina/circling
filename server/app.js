const result =require('dotenv').config();
if(result.error) {
  throw result.error;
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const useragent = require('express-useragent');
const mountRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors()); //TODO - restrict origin to a few servers
app.use(useragent.express());

mountRoutes(app);
const db = require('./db');

app.get('/healthcheck', async (req, res) => {
  const numEvents = await db('events').count().then((res)=>res[0].count);
  res.end(JSON.stringify({
    healthy: true,
    hostname: req.headers.host,
    env: `v1.1.0:${process.env.SERVER_ENV}`,
    numEvents
  }));
});

module.exports = app;
