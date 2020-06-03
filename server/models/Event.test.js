const Event = require("./Event");
const db = require("../db");
const debug = require("debug")("test");
const testUtils = require("../testUtils");
const {createTestEvent, createTestUser} = testUtils;


test("get all events", async () => {
  const pastEventId = await testUtils.createPastEvent();
  const futureEventId = await testUtils.createUpcomingEvent();

  const allEvents = await Event.all();
  expect(allEvents.map(e => e.id)).toEqual([pastEventId, futureEventId]);
});

test("get upcoming events", async () => {
  const pastEventId = await testUtils.createPastEvent();
  const futureEventId = await  testUtils.createUpcomingEvent();
  const upcomingEvents = await Event.upcoming();
  expect(upcomingEvents.map(e => e.id)).toEqual([futureEventId]);

});

test("finding an event", async () => {
  const eventId = await createTestEvent("Test Event 1");
  const event = await Event.find(eventId);
  expect(event.id).toBe(eventId);
});

test("finding an non-existing event should return null", async () => {
  const guid = await createTestUser("just-an-guid");
  const event = await Event.find(guid);
  expect(event).toBe(null);
});

test("get all events optionally include attendees", async () => {
  const eventId = await createTestEvent();
  const userId = await createTestUser();
  await Event.join(eventId, userId);
  const event = await Event.find(eventId, {includeAttendees:true});
  expect(event.attendees.map(u=>u.id)).toContain(userId);
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

test("event unjoin removes user", async ()=> {
  const eventId = await createTestEvent();
  const userId = await createTestUser();
  await Event.join(eventId, userId);

  const result = await Event.unjoin(eventId, userId);
  expect(result).toBe(1);
  const result2 = await Event.unjoin(eventId, userId);
  expect(result2).toBe(0);

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