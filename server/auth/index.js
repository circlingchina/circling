const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const debug = require("debug")("server-debug");
const _ = require('lodash');
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require('../enviornment');
const UserModel = require('../models/UserModel');

const AUTH_CONSTANTS = {
  ISS: 'Circling China',
  AUD: 'https://www.circlingchina.org',
  JWT_SECRET,
  COOKIE_NAME: "circlingchina.token",
  JWT_SIGN_OPTIONS: {
    ALGORITHM: "HS256",
    EXPIRESIN: 1200, // 20 min
  },
  JWT_REFRESH_THREASHOLD: 600, // 10 min
};

const makeUserObj = function (jwt_token, user) {
  const userObj = _.pick(user, ['id','email', 'created_at', 'premium_level', 'premium_expired_at']);
  userObj.user_metadata = {
    full_name: user.name,
  };
  userObj.token = {
    access_token: jwt_token,
    expires_at: new Date().getTime() + AUTH_CONSTANTS.JWT_SIGN_OPTIONS.EXPIRESIN * 1000,
    expires_in: AUTH_CONSTANTS.JWT_SIGN_OPTIONS.EXPIRESIN,
    token_type: 'bearer',
  };
  return userObj;
};

const makeJWTPayload =   function (user) {
  return {
    iss: 'Circling China',
    aud: 'https://www.circlingchina.org',
    sub: user.id,
    app_metadata: {
      provider: "email"
    },
    user_metadata: {
      full_name: user.name,
      email: user.email
    }
  };
};

const makeJWTtokenFromUser = function (user) {
  const jwt_payload = makeJWTPayload(user);
  debug({jwt_payload});
  const options = {
    algorithm: AUTH_CONSTANTS.JWT_SIGN_OPTIONS.ALGORITHM,
    expiresIn: AUTH_CONSTANTS.JWT_SIGN_OPTIONS.EXPIRESIN,
  };
  const jwt_token = jwt.sign(jwt_payload, AUTH_CONSTANTS.JWT_SECRET, options);
  debug({jwt_token});
  return jwt_token;
};

// JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: AUTH_CONSTANTS.JWT_SECRET,
  issuer: AUTH_CONSTANTS.ISS,
  audience: AUTH_CONSTANTS.AUD,
  ignoreExpiration: true,
};

async function _jwtAuth(jwt_payload, done) {
  debug(jwt_payload);

  let user;
  try {
    user = await UserModel.find(jwt_payload.sub);
    if (!user) {
      return done(null, false, {message: 'User not found'});
    }
  } catch (err) {
    return done(err, false);
  }
  return done(null, user);
}

function setupPassport(passport) {
  passport.use(new JwtStrategy(jwtOptions, _jwtAuth));
}

module.exports = {
  setupPassport,
  AUTH_CONSTANTS,
  makeUserObj,
  makeJWTPayload,
  makeJWTtokenFromUser,
};
