if(!process.env.NODE_ENV) {
  throw new Error("no ENV");
}
const config = require('./knexfile.js')[process.env.NODE_ENV];
if(!config) {
  throw new Error("No Config");
}
const knex = require('knex')(config);

module.exports = knex;