const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/api/events/:event_id/join', (req, res) => {
  res.send(`joining event ${req.params.event_id}`);
});

app.get('/api/events/:event_id/unjoin', (req, res) => {
  res.send(`leaving event ${req.params.event_id}`);
});

app.listen(port, () => {
  console.info(`Running on port ${port}`);
});

module.exports = app;