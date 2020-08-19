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
  const userId = await createPremiumUser('Peter', 1, true);
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

beforeEach(async () => {
  await testUtils.clearDB();
});

afterEach(async () => {
  await testUtils.clearDB();
});

afterAll(async () => {
  return db.destroy();
});
