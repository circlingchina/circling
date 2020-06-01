const app = require('./app');
const request = require('supertest');
const db = require("./db");
const debug = require('debug')('test');

test("/events should return list of events", async (done)=> {
  const eventName = "Test Event 1";
  await db("events").insert({
    name: eventName, 
    host: "tester",
    start_time: new Date(),
  });

  request(app)
    .get("/events")
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.body).toMatchObject({events: expect.any(Array)});
      const events = res.body.events;
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe(eventName);
      debug("returns events", events[0]);
    })
    .expect(200, done);

});

test.only("/events/:id/join should let user join event", async ()=> {
  const eventName = "Test Event 1";
  const eventIds = await db("events").returning('id').insert({
    name: eventName, 
    host: "tester",
    start_time: new Date(),
  });

  const userIds = await db("users").returning('id').insert({
    name: "John",
    email: "join@test.com"
  });

  const route = `/events/${eventIds[0]}/join?userId=${userIds[0]}`;
  debug(`GET ${route}`);

  await request(app)
    .get(route)
    // .set('Accept', 'application/json')
    .expect((res) => {
      debug("BODY", res.body);
      // expect(res.body).toMatchObject({events: expect.any(Array)});
      // const events = res.body.events;
      // expect(events).toHaveLength(1);
      // expect(events[0].name).toBe(eventName);
      // done();
    })
    .expect(200);

  const joinTable = await db("user_event").limit(5);
  debug("joinTable", joinTable);
  const result = await request(app).get('/events');
  debug("resulting event", result.body.events.users);
});


test("/events should return list of events", async (done)=> {
  const eventName = "Test Event 1";
  await db("events").insert({
    name: eventName, 
    host: "tester",
    start_time: new Date(),
  });

  request(app)
    .get("/events")
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.body).toMatchObject({events: expect.any(Array)});
      const events = res.body.events;
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe(eventName);
    })
    .expect(200, done);

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