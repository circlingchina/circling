const db = require("../db");
const debug = require("debug")("test");
const UserModel = require("./UserModel");
const testUtils = require("../testUtils");
const moment = require('moment');
const { createTestUser, createPremiumUser, createTestUserWithEventCredit } = testUtils;


test("find a user", async () => {
  const userId = await createTestUser('Peter');
  const user = await UserModel.find(userId);
  expect(userId).toBe(user.id);
});

test("find a user by email", async () => {
  const userId = await createTestUser('Peter');
  const user = await UserModel.findByEmail('Peter@test.com');
  expect(userId).toBe(user.id);
});

test("verify a user by password", async() => {
  const userId = await createTestUser('Peter');
  const user = await UserModel.find(userId);
  expect(UserModel.verifyPassword(user, 'password')).toBe(true);
});

test("create user", async() => {
  const userId = await UserModel.create('iAmName', 'test@user.com', 'password');
  const user = await UserModel.find(userId);
  expect(user).toBeTruthy();
});

test("none-premium cannot join non-trail events", async() => {
  const userId = await createTestUser('Peter');
  const eventId = await testUtils.createUpcomingEvent();

  expect(await UserModel.canJoin(userId, eventId)).toBe(false);
});

test("none-premium can join trail events", async() => {
  const userId = await createTestUser('Peter');
  const eventId = await testUtils.createTrailEvent();
  expect(await UserModel.canJoin(userId, eventId)).toBe(true);
});

test("user with event credit can join non-trail events", async() => {
  const userId = await createTestUserWithEventCredit();
  const eventId = await testUtils.createUpcomingEvent();

  expect(await UserModel.canJoin(userId, eventId)).toBe(true);
});

test("premium can join non-trail events", async() => {
  const userId = await createPremiumUser('Peter');
  const eventId = await testUtils.createUpcomingEvent();
  expect(await UserModel.canJoin(userId, eventId)).toBe(true);
});

test("premium can join trail events", async() => {
  const userId = await createPremiumUser('Peter');
  const eventId = await testUtils.createTrailEvent();
  expect(await UserModel.canJoin(userId, eventId)).toBe(true);
});

test("expired premium cannot join and user becomes non-premium", async() => {
  const userId = await createPremiumUser('Peter', '2', true);
  const eventId = await testUtils.createUpcomingEvent();
  expect(await UserModel.canJoin(userId, eventId)).toBe(false);

  const user = await UserModel.find(userId);
  expect(user.premium_level).toBe('0');
});

test("paied for single event", async() => {
  const userId = await createTestUser('Peter');
  await UserModel.enablePremium(userId, 'SINGLE_EVENT');

  const user = await UserModel.find(userId);
  expect(user.premium_level).toBe('0');
  expect(user.event_credit).toBe(1);
  expect(moment(user.premium_expired_at).isSame(moment(), 'day'));
});

test("enable premium monthly", async() => {
  const userId = await createTestUser('Peter');
  await UserModel.enablePremium(userId, 'MONTHLY');

  const user = await UserModel.find(userId);
  expect(user.premium_level).toBe('2');
  expect(
    moment(user.premium_expired_at).isSame(
      moment().add(31, 'days'), 'day')
  );
});

test("enable premium half year", async() => {
  const userId = await createTestUser('Peter');
  await UserModel.enablePremium(userId, 'HALF_YEAR');

  const user = await UserModel.find(userId);
  expect(user.premium_level).toBe('3');
  expect(
    moment(user.premium_expired_at).isSame(
      moment().add(183, 'days'), 'day')
  );
});

test("enable premium VIP", async() => {
  const userId = await createTestUser('Peter');
  await UserModel.enablePremium(userId, 'VIP');

  const user = await UserModel.find(userId);
  expect(user.premium_level).toBe('4');
  expect(
    moment(user.premium_expired_at).isSame(
      moment().add(365 * 5 + 1, 'days'), 'day')
  );
});

test("create and delete password_reset record", async() => {
  const userId = await createTestUser('Peter');
  const passwordResetId = await UserModel.createPasswordReset(userId);
  let passwordReset = await UserModel.findPasswordReset(passwordResetId);
  expect(userId).toBe(passwordReset.user_id);

  const deleted = await UserModel.deleteFindPasswordReset(userId);
  expect(deleted).toBe(1);

  passwordReset = await UserModel.findPasswordReset(passwordResetId);
  expect(passwordReset).toBe(null);
});

test("change password for given user", async () => {
  const userId = await createTestUser('Peter');
  let user = await UserModel.find(userId);
  const oldSalt = user.salt;
  const oldPasswordHexdigest = user.password_hexdigest;

  await UserModel.changePassword(userId, 'password');
  user = await UserModel.find(userId);

  expect(user.salt).not.toBe(oldSalt);
  expect(user.password_hexdigest).not.toBe(oldPasswordHexdigest);
});

test("create precreate user record, then delete" , async() => {
  const precreateUserId = await UserModel.createPrecreateUser(
    'name', 'name@email.com', 'password'
  );
  const precreateUser = await UserModel.findPrecreateUser(precreateUserId);
  expect(precreateUser.email).toBe('name@email.com');

  await UserModel.deletePrecreateUserByEmail('name@email.com');
  expect(await UserModel.findPrecreateUser(precreateUserId)).toBe(null);
});

beforeEach(async () => {
  await testUtils.clearDB();
});

afterEach(async () => {
  await testUtils.clearDB();
});

afterAll(async () => {
  return db.destroy();
});
