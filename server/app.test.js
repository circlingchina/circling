const app = require('./app');
const request = require('supertest');
const db = require("./db");
const debug = require('debug')('test');
const testUtils = require("./testUtils");
const Event = require('./models/Event');
const sinon = require("sinon");
const UserModel = require('./models/UserModel');

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

test("/events/:id/join should let premium user join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createPremiumUser();

  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  //stub out the email request
  const joinEmailStub = sinon.stub(UserModel, "handleFirstJoinEmail");
  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  
  sinon.assert.calledOnceWithExactly(joinEmailStub, userId, eventId);
  const users = await Event.attendees(eventId);
  expect(users.map(u=>u.id)).toEqual([userId]);
});

test("/events/:id/join should not let user join when is full", async ()=> {
  const eventId = await testUtils.createTestEvent("Test Event", new Date(), 'Circling', 1);
  const userId1 = await testUtils.createPremiumUser('u1');
  const userId2 = await testUtils.createPremiumUser('u2');

  let route = `/events/${eventId}/join?user_id=${userId1}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  
  const users = await Event.attendees(eventId);
  expect(users.map(u=>u.id)).toEqual([userId1]);
  
  route = `/events/${eventId}/join?user_id=${userId2}`;
  debug(`GET ${route}`);
  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe("event is full");
    })
    .expect(400);
});

test("/events/:id/join should not let non-premium user join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUser();

  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe('invalid user id');
    })
    .expect(400);
});

test("/events/:id/join should let non-premium user with credit join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUserWithEventCredit();
  
  let route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);
  
  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  
  let user = await UserModel.find(userId);
  expect(user.event_credit).toBe(0);
  
  route = `/events/${eventId}/unjoin?user_id=${userId}`;
  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
  user = await UserModel.find(userId);
  expect(user.event_credit).toBe(1);
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

test("/events/:id/join should not let premium user join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingEvent(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000));
  
  // will expire in 2 days
  const userId = await testUtils.createPremiumUser();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe('invalid user id');
    })
    .expect(400); 
});

test("/events/:id/join should let non-premium user (with credit) join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingEvent(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000));
  
  // will expire in 2 days
  const userId = await testUtils.createTestUserWithEventCredit();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
});

test("/events/:id/join should let non-premium user (with credit) join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingNonCirclingEvent(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000));
  
  // will expire in 2 days
  const userId = await testUtils.createTestUserWithEventCredit();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe('invalid user id');
    })
    .expect(400); 
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

test("POST /users should create new user", async (done)=> {
  debug("testing creation of user");
  const userParam = {
    name: "John",
    email: "john@test.com"
  };
  // let numUsers = await db('users').count();
  // expect(numUsers).toBe(0);

  request(app)
    .post("/users")
    .send(userParam)
    .set('Accept', 'application/json')
    .expect(async (res) => {
      expect(res.body).toMatchObject({id: expect.any(String)});

      // numUsers = await db('users').count();
      // expect(numUsers).toBe(1);
    })
    .expect(200, done);

});

beforeEach(async () => {
  await testUtils.clearDB();
});

afterEach(async () => {
  try {
    await testUtils.clearDB();
  } catch (e) {
    debug(e);
  }
});

afterAll(async () => {
  return db.destroy();
});
