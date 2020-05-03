require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const airtable = require('../src/airtable/api');
const cors = require('cors');
const app = express();
let helmet = require('helmet');
const {sendWelcomeMail, sentFirstEventEmail} = require('./emailService');

app.use(helmet());
app.use(bodyParser.json());

//TODO - restrict origin to a few servers
app.use(cors());

const port = process.env.API_PORT || 3000;

app.get('/api/events/:event_id/join', async (req, res) => {
  const event_id = req.params.event_id;
  const user_id = req.query.user_id; // TODO authenticate the user
  airtable.getEvent(event_id)
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
    .then(async () => {
      console.log("userId", user_id);
      const user = await airtable.getUser(user_id);
      
      return user;
    })
    .then(async (user) => {
      let sentEmail = false;
      console.log("got back user", user);
      if(user.fields.sentFirstEventEmail == 0) {
        console.log("send AWS email to", user.fields.email);
        const data = await sentFirstEventEmail(user.fields.Name, user.fields.email);
        console.log("data", data.MessageId);
        sentEmail = true;
      }
      return sentEmail;
    })
    .then((sentEmail) => {
      console.log("sentEmail", sentEmail);
      if(sentEmail) {
        console.log("update airtable recored");
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
      airtable.unjoin(event._rawJson, user_id).then((result) => {
        //pick the min amount of useful info to send back
        const responseJson = {id: result.id, fields: result.fields};
        res.status(200).end(JSON.stringify(responseJson));
      });
    }
  }, (error) => {
    console.error("error", error);
    res.status(error.statusCode).end(JSON.stringify(error.message));
  });
});

app.listen(port, () => {
  console.info(`Running on port ${port}`);
});

module.exports = app;