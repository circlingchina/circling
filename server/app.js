const result =require('dotenv').config();
if(result.error) {
  throw result.error;
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mountRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors()); //TODO - restrict origin to a few servers

mountRoutes(app);


app.get('/api/healthcheck', async (req, res) => {
  res.end(JSON.stringify({
    healthy: true,
    hostname: req.headers.host,
    env: `v1.0.0:${process.env.SERVER_ENV}`
  }));
});

module.exports = app;