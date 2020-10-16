const db = require("../db");

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


module.exports = (app) => {
  app.get('/users/find', find);
};
