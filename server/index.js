require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const airbaseApi = require('../src/airtable/api');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());

//TODO - restrict origin to a few servers
app.use(cors());

const port = process.env.API_PORT || 3000;

app.get('/api/events/:event_id/join', async (req, res) => {
  const event_id = req.params.event_id;
  const user_id = req.query.user_id; // TODO authenticate the user
  airbaseApi.getEvent(event_id).then((event)=> {
    if(event) {
      airbaseApi.join(event._rawJson, user_id).then((result) => {
        
        //pick the min amount of useful info to send back
        const responseJson = {id: result[0].id, fields: result[0].fields};
        res.status(200).end(JSON.stringify(responseJson));
      });
    }
  }, (error) => {
    console.error("error", error);
    res.status(error.statusCode).end(JSON.stringify(error.message));
  });

});

app.get('/api/events/:event_id/unjoin', async (req, res) => {
  const event_id = req.params.event_id;
  const user_id = req.query.user_id; // TODO authenticate the user
  res.send(`leaving event ${event_id}`);
  const event = await airbaseApi.getEvent(event_id);
});

app.listen(port, () => {
  console.info(`Running on port ${port}`);
});

module.exports = app;