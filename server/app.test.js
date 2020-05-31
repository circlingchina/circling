const app = require('./app');
const request = require('supertest');
const db = require("./db");

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

beforeAll(async () => {
  await db("events").del();
});

afterAll(async () => {
  await db("events").del();
  return db.destroy();
});