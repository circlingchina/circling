if(!process.env.NODE_ENV) {
  throw new Error("NODE_ENV must be set");
}
const config = require('./knexfile.js')[process.env.NODE_ENV];
if(!config) {
  throw new Error("No Config");
}
const knex = require('knex')(config);

module.exports = knex;