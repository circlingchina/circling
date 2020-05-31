const config = require('./knexfile.js')[process.env.NODE_ENV];
const knex = require('knex')(config);

module.exports = knex;