const result =require('dotenv').config();
if(result.error) {
  throw result.error;
}

const express = require('express');
const bodyParser = require('body-parser');
const airtable = require('../src/airtable/api');
const cors = require('cors');
const app = express();
let helmet = require('helmet');
const {sentFirstEventEmail} = require('./emailService');

app.use(helmet());
app.use(bodyParser.json());

//TODO - restrict origin to a few servers
app.use(cors());

const port = process.env.API_PORT || 4567;

app.get('/api/events/:event_id/join', async (req, res) => {
  const event_id = req.params.event_id;
  const user_id = req.query.user_id; // TODO authenticate the user
  
  // Step 1: retrieve the full event info, which contains list of users
  airtable.getEvent(event_id)
    // Step 2: join event by appending user to event.users list
    .then((event)=> {
      if(event) {
        airtable.join(event._rawJson, user_id).then((events) => {
        
          //pick the min amount of useful info to send back
          const responseJson = {id: events[0].id, fields: events[0].fields};
          res.status(200).end(JSON.stringify(responseJson));
        });
      }
      return user_id;
    })
    // Step 3: retrieve the full user object, so we can execute email logic
    .then(async () => {
      const user = await airtable.getUser(user_id);
      
      return user;
    })
    // Step 4: conditionally send the first event instructional email to user
    .then(async (user) => {
      let sentMessageId = null;
      if(user.fields.sentFirstEventEmail == 0) {
        const data = await sentFirstEventEmail(user.fields.Name, user.fields.email);
        sentMessageId = data.MessageId;
      }
      return {sentMessageId, sentFirstEventEmail: user.fields.sentFirstEventEmail+1};
    })
    // Step 5: update the user.sentFirstEventEmail state
    .then(({sentMessageId, sentFirstEventEmail}) => {
      if(sentMessageId) {
        const awsRet = airtable.updateUser(user_id, {sentFirstEventEmail});
        return awsRet;
      }
    })
    .catch((error) => {
      console.error("error", error);
      res.status(error.statusCode).end(JSON.stringify(error.message));
    });

});

app.get('/api/events/:event_id/unjoin', async (req, res) => {
  const event_id = req.params.event_id;
  const user_id = req.query.user_id; // TODO authenticate the user
  airtable.getEvent(event_id).then((event)=> {
    if(event) {
      airtable.unjoin(event._rawJson, user_id).then((events) => {
        //pick the min amount of useful info to send back
        const responseJson = {id: events[0].id, fields: events[0].fields};
        res.status(200).end(JSON.stringify(responseJson));
      });
    }
  }, (error) => {
    console.error("error", error);
    res.status(error.statusCode).end(JSON.stringify(error.message));
  });
});

app.get('/api/healthcheck', async (req, res) => {
  res.end(JSON.stringify({
    healthy: true,
    hostname: req.headers.host,
    env: `v1.0.0:${process.env.SERVER_ENV}`
  }));
});

app.listen(port, () => {
  console.info(`Running on port ${port}`);
});

module.exports = app;