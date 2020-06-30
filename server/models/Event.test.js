const _ = require("lodash");
const Event = require("./Event");
const db = require("../db");
const debug = require("debug")("test");
const testUtils = require("../testUtils");
const {createTestEvent, createTestUser, createTrailEvent, createUserEvent} = testUtils;


test("get all events", async () => {
  const pastEventId = await testUtils.createPastEvent();
  const futureEventId = await testUtils.createUpcomingEvent();

  const allEvents = await Event.all();
  expect(allEvents.map(e => e.id)).toEqual([pastEventId, futureEventId]);
});

test("get upcoming events", async () => {
  await testUtils.createPastEvent();
  const futureEventId = await  testUtils.createUpcomingEvent();
  const upcomingEvents = await Event.upcoming();
  expect(upcomingEvents.map(e => e.id)).toEqual([futureEventId]);

});

test("finding an event", async () => {
  const eventId = await createTestEvent("Test Event 1");
  const event = await Event.find(eventId);
  expect(event.id).toBe(eventId);
});

test("getting trail event", async() => {
  const eventId = await createTrailEvent();
  const event = await Event.find(eventId);
  expect(event.category).toBe('新人介绍课程');
});

test("getting next valid trail event", async() => {
  const now = new Date();
  const eventId1 = await createTrailEvent("trail1", new Date(now.getTime() + 10000000));
  await createTrailEvent("trail2", new Date(now.getTime() + 20000000));
  
  const events = await Event.nextTrail();
  
  expect(events[0].id).toBe(eventId1);
  expect(events[0].category).toBe('新人介绍课程');
});

test("getting empty array if there is no trail event in the future", async() => {
  const now = new Date();
  await createTrailEvent("trail1", new Date(now.getTime() - 10000000));

  const events = await Event.nextTrail();
  expect(events).toEqual([]);
});

test("getting the nearest non-full trail event", async() => {
  const now = new Date();
  const eventId1 = await createTrailEvent("trail1", new Date(now.getTime() + 10000000));
  const eventId2 = await createTrailEvent("trail2", new Date(now.getTime() + 20000000));
  const eventId3 = await createTrailEvent("trail3", new Date(now.getTime() + 30000000));
  
  for (const no of _.range(10)) {
    const userId = await createTestUser("username1"+no);
    await createUserEvent(eventId1, userId);
  }
  
  for (const no of _.range(5)) {
    const userId = await createTestUser("username2"+no);
    await createUserEvent(eventId1, userId);
  }
  
  const events = await Event.nextTrail();
  expect(events[0].id).toBe(eventId2);
});

test("getting a null trail event", async() => {
  const now = new Date();
  await createTrailEvent("trail1", new Date(now.getTime() - 10000000));
  const events = await Event.nextTrail();
  expect(events).toEqual([]);
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

test("event fields", async ()=> {
  const extraFields = {a: 5, b: 6};
  const id = await db("events").returning('id').insert({
    name: "event with fields",
    host: "host",
    start_time: new Date(),
    fields: JSON.stringify(extraFields)
  }).then(ids=>ids[0]);
  const event = await Event.find(id);
  expect(event.fields).toEqual(extraFields);
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
