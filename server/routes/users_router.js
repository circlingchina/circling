const debug = require("debug")("server");
// const User = require('../models/User');
const db = require("../db");
const update = async (req, res) => {

  const id = req.params.user_id;
  const userParams = req.body;

  debug({id, userParams});
  const updateResult = await db("users").update(userParams).where({id});
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: updateResult
    }));
};

module.exports = (app) => {
  app.put('/users/:user_id', update);
};