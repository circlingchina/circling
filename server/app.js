const result =require('dotenv').config();
if(result.error) {
  throw result.error;
}

const express = require('express');
require('express-async-errors')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const useragent = require('express-useragent');

const passport = require('passport');

const { setupPassport } = require('./auth');
const mountRoutes = require('./routes');
const db = require('./db');

const mainLogger = require("./logger");
const NAME = 'app';
const logger = mainLogger.child({ label: NAME });

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: function (req, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET','PUT','POST','OPTION'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-jwt-aud'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(useragent.express());

// auth
app.use(passport.initialize());

app.use((err, req, res, next) => {
  logger.info('error', {err});
  if (req.xhr) {
    return res.json({
      state: false,
      msg: err.message
    });
  }
  next(err);
});

setupPassport(passport);
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

