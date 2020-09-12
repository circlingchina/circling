const result =require('dotenv').config();
if(result.error) {
  throw result.error;
}

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const useragent = require('express-useragent');

const passport = require('passport');

const { setupPassport } = require('./auth');
const mountRoutes = require('./routes');
const db = require('./db');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:4567',
    'https://www.circlingchina.org',
    'https://circlingchina.org',
    'https://www.circlingquanquan.com',
    'https://circlingquanquan.com'
  ],
  credentials: true,
}));
app.use(useragent.express());

// auth
app.use(passport.initialize());
setupPassport(passport);
// app.use(passport.session());

mountRoutes(app);

app.get('/healthcheck', async (req, res) => {
  const numEvents = await db('events').count().then((res)=>res[0].count);
  res.end(JSON.stringify({
    healthy: true,
    hostname: req.headers.host,
    env: `v1.1.0:${process.env.SERVER_ENV}`,
    numEvents
  }));
});

/***************** 404 Handler  *************/
app.use((req, res) => {
  let err = new Error('Not Found');
  err.status = 404;
  res.json({message: err.message});
});

/********************************************/

module.exports = app;
