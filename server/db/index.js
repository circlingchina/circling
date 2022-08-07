const node_env = process.env.NODE_ENV || "development";

console.log('node_env', node_env)

const config = require('./knexfile.js')[node_env];
if(!config) {
  throw new Error("No Config");
}
const knex = require('knex')(config);

module.exports = knex;