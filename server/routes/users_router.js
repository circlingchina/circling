const debug = require("debug")("server");
// const User = require('../models/User');
const db = require("../db");

const update = async(req, res) => {

  const id = req.params.user_id;
  const userParams = req.body; //{email: 'some@email.com'}
  const updateResult = await db("users").update(userParams).where({id});
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: updateResult
    }));
};

const find = async(req, res) => {
  const query = req.query;

  const users = await db("users").where(query).limit(1);
  debug({query});
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      user: users.length > 0 ? users[0] : null
    }));
};

module.exports = (app) => {
  app.get('/users/find', find);
  app.put('/users/:user_id', update);
};