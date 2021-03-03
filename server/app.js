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

app.use(function(req, res, next) {
  let reqDomain = domain.create();
  reqDomain.on('error', function (err) { 
       res.send(500, err.stack);
   });
  reqDomain.run(next);
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

