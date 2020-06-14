const node_env = process.env.NODE_ENV || "development";

const config = require('./knexfile.js')[node_env];
if(!config) {
  throw new Error("No Config");
}
const knex = require('knex')(config);

module.exports = knex;