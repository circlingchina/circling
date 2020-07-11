const db = require("../db");
const debug = require("debug")("test");
const UserModel = require("./UserModel");
const testUtils = require("../testUtils");
const { createTestUser, createPremiumUser } = testUtils;


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

beforeEach(async () => {
  await testUtils.clearDB();
});

afterEach(async () => {
  await testUtils.clearDB();
});

afterAll(async () => {
  return db.destroy();
});
