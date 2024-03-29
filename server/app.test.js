const app = require('./app');
const request = require('supertest');
const mockdate = require('mockdate');
const db = require("./db");
const debug = require('debug')('test');
const testUtils = require("./testUtils");
const Event = require('./models/Event');
const sinon = require("sinon");
const UserModel = require('./models/UserModel');

const { makeJWTtokenFromUser } = require("./auth");

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

  const user = await UserModel.find(userId);

  const route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);

  //stub out the email request
  const joinEmailStub = sinon.stub(UserModel, "handleFirstJoinEmail");
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.hasOwnProperty('isInJoinableTimeFrame')).toBe(true);
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
  // debug(`GET ${route}`);
  const user1 = await UserModel.find(userId1);
  const user2 = await UserModel.find(userId2);
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user1)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);

  const users = await Event.attendees(eventId);
  expect(users.map(u=>u.id)).toEqual([userId1]);

  route = `/events/${eventId}/join?user_id=${userId2}`;
  // debug(`GET ${route}`);
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user2)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe("event is full");
    })
    .expect(400);
});

test("/events/:id/join should not let non-premium user join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUser();

  const user = await UserModel.find(userId);

  const route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Accept', 'application/json')
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .expect((res) => {
      expect(res.body.err).toBe('invalid user id');
    })
    .expect(400);
});

test("/events/:id/join should let non-premium user with credit join event", async ()=> {
  const eventId = await testUtils.createUpcomingEvent();
  const userId = await testUtils.createTestUserWithEventCredit();
  let user = await UserModel.find(userId);
  let route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);

  user = await UserModel.find(userId);
  expect(user.event_credit).toBe(0);

  route = `/events/${eventId}/unjoin?user_id=${userId}`;
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
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
  const user = await UserModel.find(userId);

  const route = `/events/${eventId}/unjoin?user_id=${userId}`;
  // debug(`GET ${route}`);

  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.hasOwnProperty('isInJoinableTimeFrame')).toBe(true);
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);

  const users = await Event.attendees(eventId);
  expect(users).toEqual([]);
});

test("/events/:id/join should not let premium user join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingEvent(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000));

  // will expire in 2 days
  const userId = await testUtils.createPremiumUser();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);

  const user = await UserModel.find(userId);

  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.err).toBe('invalid user id');
    })
    .expect(400);
});

// test("/events/:id/join should not let premium user join event starting after 3 days later", async ()=> {
//   // will start in 5 days
//   const eventId = await testUtils.createUpcomingEvent(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000));

//   const userId = await testUtils.createPremiumUser();
//   const route = `/events/${eventId}/join?user_id=${userId}`;

//   const user = await UserModel.find(userId);

//   await request(app)
//     .get(route)
//     .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
//     .set('Accept', 'application/json')
//     .expect((res) => {
//       expect(res.body.err).toBe('event is unjoinable');
//     })
//     .expect(400);
// });

test("/events/:id/join should let non-premium user (with credit) join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingEvent(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000));

  // will expire in 2 days
  const userId = await testUtils.createTestUserWithEventCredit();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);
  const user = await UserModel.find(userId);
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
    .set('Accept', 'application/json')
    .expect((res) => {
      expect(res.body.event.id).toBe(eventId);
    })
    .expect(200);
});

test("/events/:id/join should let non-premium user (with credit) join event started after the premium is expired", async ()=> {
  // will start in 5 days
  const eventId = await testUtils.createUpcomingNonCirclingEvent(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000));

  // will expire in 2 days
  const userId = await testUtils.createTestUserWithEventCredit();
  const route = `/events/${eventId}/join?user_id=${userId}`;
  // debug(`GET ${route}`);
  const user = await UserModel.find(userId);
  await request(app)
    .get(route)
    .set('Authorization', `bearer ${makeJWTtokenFromUser(user)}`)
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
  // debug("testing creation of user");
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

test("POST /auth/passwordRecovery with a dummy email", async (done) => {
  const param = {
    email: "dummy@test.com",
  };

  request(app)
    .post("/auth/passwordRecovery")
    .send(param)
    .set('Accept', 'application/json')
    .expect(async (res) => {
      expect(res.body).toMatchObject({id: ""});
    })
    .expect(200, done);
});

test("POST /auth/passwordRecovery with a non-email string", async (done) => {
  const param = {
    email: "i-am-not-email",
  };

  request(app)
    .post("/auth/passwordRecovery")
    .send(param)
    .set('Accept', 'application/json')
    .expect(async (res) => {
      expect(res.body).toMatchObject({});
    })
    .expect(400, done);
});

test("POST /auth/passwordRecoveryPerform with given password", async (done) => {
  const userId = await testUtils.createTestUser();
  const passwordResetId = await UserModel.createPasswordReset(userId);

  const param = {
    password: "very-secure",
    userId
  };

  request(app)
    .post(`/auth/passwordRecoveryPerform`)
    .send(param)
    .set('Accept', 'application/json')
    .expect(async (res) => {
      expect(res.body);
    })
    .expect(200, done);
});

test("Fetch JWT token for a registered user, then refresh the token", async (done) => {
  await testUtils.createTestUser('peter');
  const param = {
    email:'peter@test.com',
    password: 'password'
  };
  let cookie;

  request(app)
    .post(`/auth/token`)
    .set('Accept', 'application/json')
    .send(param)
    .expect(200)
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      const cookies = res.headers['set-cookie'];
      expect(cookies.filter(element => {
        let ret = element.startsWith('circlingchina.token=');
        if (ret) {
          cookie = element;
        }
        return ret;
      }).length).toBe(1);

      // debug({cookie});
      let now = new Date();
      let fixedTime = new Date(now.getTime() + 15 * 60 * 1000);

      request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send()
        .expect(400);

      mockdate.set(fixedTime);
      request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const cookies = res.headers['set-cookie'];
          expect(cookies.filter(element => {
            let ret = element.startsWith('circlingchina.token=');
            return ret;
          }).length).toBe(1);

          mockdate.reset();
          done();
        });

    });
});

test("Refresh JWT token for a non-registerd user", async (done) => {
  const param = {
    email:'does-not-exist@test.com',
    password: 'password'
  };

  request(app)
    .post(`/auth/token`)
    .set('Accept', 'application/json')
    .send(param)
    .expect(401, done);
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
