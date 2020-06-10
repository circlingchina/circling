const db = require("../db");
const debug = require("debug")("test");
const UserModel = require("./UserModel");
const testUtils = require("../testUtils");
const {createTestUser} = testUtils;


test("find a user", async () => {
  const userId = await createTestUser('Peter');
  const user = await UserModel.find(userId);
  expect(userId).toBe(user.id);
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
