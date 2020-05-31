// get events
// join event
// unjoin event

const express = require("express");
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res) => {
  const events = await db('events').limit(5);
  res
    .type('json')
    .end(JSON.stringify({events: events}));
});

router.get('/:id/join', async (req, res) => {
  res
    .type('json')
    .send("join");
});

module.exports = router;