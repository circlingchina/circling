// get events
// join event
// unjoin event

const express = require("express");
const router = new express.Router();

router.get('/', async (req, res) => {
  res
    .type('json')
    .end(JSON.stringify({events: [1,2,3]}));
});

router.get('/:id/join', async (req, res) => {
  res
    .type('json')
    .send("join");
});

module.exports = router;