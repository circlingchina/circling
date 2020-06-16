const debug = require("debug")("server");
// const User = require('../models/User');
const db = require("../db");

const update = async(req, res) => {

  const id = req.params.user_id;
  const userParams = req.body; //{email: 'some@email.com'}
  const users = await db("users").returning('*').update(userParams).where({id});

  const user = users.length > 0 ? users[0] : null;

  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      user
    }));
};

const find = async(req, res) => {
  const query = req.query;

  const users = await db("users").where(query).limit(1);
  
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      user: users.length > 0 ? users[0] : null
    }));
};

const create = async(req, res) => {
  const userParams = req.body;
  // upsert - on conflict update
  const query = db.raw(
    `? ON CONFLICT (email)
            DO UPDATE SET
            name = EXCLUDED.name
          RETURNING id;`,
    [db("users").insert(userParams)],
  );
  const result = await query;
  let id = null;
  if(result.rowCount > 0) {
    id = result.rows[0].id;
  } 
  debug({id});
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      id
    }));
};

module.exports = (app) => {
  app.get('/users/find', find);
  app.post('/users', create);
  app.put('/users/:user_id', update);
};