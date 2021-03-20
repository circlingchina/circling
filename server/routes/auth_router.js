const debug = require("debug")("server");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const validator = require('validator');

const { JWT_SECRET } = require("../enviornment");
const UserModel = require("../models/UserModel");
const EmailService = require("../emailService");
const { AUTH_CONSTANTS, makeUserObj, makeJWTtokenFromUser } = require("../auth");

const JWT_EXPIRY_SECONDS = AUTH_CONSTANTS.JWT_SIGN_OPTIONS.EXPIRESIN;
const COOKIE_NAME = AUTH_CONSTANTS.COOKIE_NAME;

// Issue JWT token
const authToken = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).end();
  }

  let user = await UserModel.findByEmail(email);
  if (!user) {
    return res.status(401)
      .json({ message: "No user found with this email" })
      .end();
  }

  if (user.salt.length == 0) {
    // check for registered user before migration
    // Ask user to reset the password
    return res.status(401)
      .json({ message: "Password reset request for migrated users" })
      .end();
  }

  let match = UserModel.verifyPassword(user, password);
  if (!match) {
    return res.status(401)
      .json({ message: "Email not confirmed" })
      .end();
  }

  const jwt_token = makeJWTtokenFromUser(user);

  res.cookie(COOKIE_NAME, jwt_token, { maxAge: JWT_EXPIRY_SECONDS * 1000 });
  res.json(makeUserObj(jwt_token, user));
  res.end();
};

// Refresh JWT token
const authRefresh = async (req, res) => {

  const token = _.get(req.cookies, COOKIE_NAME);

  if (!token) {
    return res.status(401).end();
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end();
    }
    return res.status(400).end();
  }
  debug({ payload });

  const user = await UserModel.find(payload.sub);
  if (!user) {
    return res.status(404).end();
  }

  // // We ensure that a new token is not issued until enough time has elapsed
  // // In this case, a new token will only be issued if the old token is within
  // // 30 min of expiry. Otherwise, return a bad request status

  const nowUnixSeconds = Math.round(Number(new Date()) / 1000);

  if (payload.exp - nowUnixSeconds > AUTH_CONSTANTS.JWT_REFRESH_THREASHOLD) {
    return res.status(400).end();
  }

  // Remove `iat` and `exp` from the paylaod, so we can re-sign it.
  delete payload.iat;
  delete payload.exp;

  // Now, create a new token for the current user, with a renewed expiration time
  const new_jwt_token = makeJWTtokenFromUser(user);

  debug({ new_jwt_token });

  res.cookie(COOKIE_NAME, new_jwt_token, { maxAge: JWT_EXPIRY_SECONDS * 1000 });
  res.json(makeUserObj(new_jwt_token, user));
  res.end();
};

const signup = async (req, res) => {
  const { email, password, data } = req.body;
  const { full_name: name } = data;

  await UserModel.deletePrecreateUserByEmail(email);

  // create precreate_user;
  const precreateUserId = await UserModel.createPrecreateUser(name, email, password);
  // If the email already registered or somehow not able to create a precreate user, return 400
  if (!precreateUserId) {
    res.sendStatus(400);
    res.end();
    return
  }

  // send email
  await EmailService.sendVerificationEmail(email, precreateUserId);

  debug(`verification mail sent with token: ${precreateUserId}`);
  res.sendStatus(200);
  res.end();
};

const confirm = async (req, res) => {
  const { token: precreateUserId } = req.body;

  const precreateUser = await UserModel.findPrecreateUser(precreateUserId);
  if (!precreateUser) {
    res.statusCode(400);
    res.end();
  }

  const userId = await UserModel.createPwdDigest(
    precreateUser.name,
    precreateUser.email,
    precreateUser.salt,
    precreateUser.password_hexdigest,
  );

  // Now the real user record has been created, so we can safely delete the precreate_user record
  await UserModel.deletePrecreateUser(precreateUserId);

  const user = await UserModel.find(userId);

  const jwt_token = makeJWTtokenFromUser(user);

  res.cookie(COOKIE_NAME, jwt_token, { maxAge: JWT_EXPIRY_SECONDS * 1000 });
  res.json(makeUserObj(jwt_token, user));
  res.end();
};

const passwordRecovery = async (req, res) => {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    res.status(400).type('json').send(JSON.stringify({}));
    return;
  }

  const user = await UserModel.findByEmail(email);
  let passwordResetId = '';

  if (user) {
    passwordResetId = await UserModel.createPasswordReset(user.id);

    // send email
    await EmailService.sendPasswordResetEmail(user.email, passwordResetId);
    debug(`password reset mail sent with id: ${passwordResetId}`);
  } else {
    debug(`User not found by email ${email}`);
  }

  res.status(200).type('json').send(JSON.stringify({ id: passwordResetId }));
};

const passwordRecoveryConfirm = async (req, res) => {
  const { token: passwordResetId } = req.body;

  if (!validator.isUUID(passwordResetId)) {
    res.status(400).type('json').send(JSON.stringify({}));
    return;
  }

  const passwordReset = await UserModel.findPasswordReset(passwordResetId);
  if (!passwordReset) {
    res.statusCode(400);
    res.end();
  }
  const userId = passwordReset.user_id;

  await UserModel.deletePrecreateUser(userId);

  const user = await UserModel.find(userId);

  const jwt_token = makeJWTtokenFromUser(user);

  res.cookie(COOKIE_NAME, jwt_token, { maxAge: JWT_EXPIRY_SECONDS * 1000 });
  res.json(makeUserObj(jwt_token, user));
  res.end();
};

const doResetPassword = async (req, res) => {

  const { userId, password } = req.body;

  if (!validator.isUUID(userId)) {
    res.status(400).type('json').send(JSON.stringify({}));
    return;
  }

  const passwordResetRecord = await UserModel.findPasswordResetByUserId(userId);

  if (passwordResetRecord) {
    await UserModel.changePassword(userId, password);
    await UserModel.deleteFindPasswordReset(userId);
  }

  const user = await UserModel.find(userId);

  const jwt_token = makeJWTtokenFromUser(user);

  res.cookie(COOKIE_NAME, jwt_token, { maxAge: JWT_EXPIRY_SECONDS * 1000 });
  res.json(makeUserObj(jwt_token, user));
  res.end();
};


module.exports = (app) => {
  app.post('/auth/token', authToken);
  app.post('/auth/refresh', authRefresh);
  app.post('/auth/signup', signup);
  app.post('/auth/confirm', confirm);

  app.post('/auth/passwordRecovery', passwordRecovery);
  app.post('/auth/passwordRecoveryConfirm', passwordRecoveryConfirm);
  app.post('/auth/passwordRecoveryPerform', doResetPassword);
};
