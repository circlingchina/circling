const app = require('./app');
const request = require('supertest');
const db = require("./db");
const debug = require('debug')('test');
const testUtils = require("./testUtils");
const Event = require('./models/Event');

test("/events should return list of upcoming events", async (done)=> {
  await testUtils.createPastEvent();
  const futureEventId = await testUtils.createUpcomingEvent();

  request(app)
    .get("/events")
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.body).toMatchObject({events: expect.any(Array)});
      const events = res.body.events;
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(futureEventId);
    })
    .expect(200, done);

});

test("/events/:id/join should let user join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUser();

  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  
  const users = await Event.attendees(eventId);
  expect(users.map(u=>u.id)).toEqual([userId]);
});

test("/events/:id/unjoin should let user unjoin event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUser();
  Event.join(eventId, userId);

  const route = `/events/${eventId}/unjoin?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  
  const users = await Event.attendees(eventId);
  expect(users).toEqual([]);
});

test("/events result should contain list of attendees", async (done)=> {

  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUser();

  Event.join(eventId, userId);

  request(app)
    .get("/events")
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body).toMatchObject({events: expect.any(Array)});
      const events = res.body.events;
      expect(events).toHaveLength(1);
      expect(events[0].attendees.map(u=>u.id)).toEqual([userId]);
    })
    .expect(200, done);

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
