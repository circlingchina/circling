const Event = require("./Event");
const db = require("../db");
const debug = require("debug")("test");

async function createTestEvent(name="Test Event") {
  return db("events").returning('id').insert({
    name: name, 
    host: "tester",
    start_time: new Date(),
  }).then(ids=>ids[0]);
}

async function createTestUser(name="Alice") {
  return db("users").returning('id').insert({
    name: name,
    email: `${name}@test.com`
  }).then(ids=>ids[0]);
}

test("finding an event", async () => {
  const eventId = await createTestEvent("Test Event 1");
  const event = await Event.find(eventId);
  expect(event.id).toBe(eventId);
});

test("finding an non-existing event should return null", async () => {
  const guid = await createTestUser("just-an-guid");
  const event = await Event.find(guid);
  debug({event});
  expect(event).toBe(null);
});

test("joining an event", async ()=> {
  const eventId = await createTestEvent();
  const userId = await createTestUser();
  await Event.join(eventId, userId);
  const users = await Event.attendees(eventId);
  expect(users.map(user=>user.id)).toContain(userId);
});

test("joining an event twice does not error", async ()=> {
  const eventId = await createTestEvent();
  const userId = await createTestUser();
  const result1 = await Event.join(eventId, userId);
  expect(result1.rowCount).toBe(1);
  const result2 = await Event.join(eventId, userId);
  expect(result2.rowCount).toBe(0);

});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await clearDB();
  return db.destroy();
});

async function clearDB() {
  await db("events").del();
  await db("users").del();
}