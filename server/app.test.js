const app = require('./app');
const request = require('supertest');

test("/events should return list of events", (done)=> {
  request(app)
    .get("/events")
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect((res) => {
      console.log(res.body);
      console.log(res.text);
    })
    .expect(200, done);

});