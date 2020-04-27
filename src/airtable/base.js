const Airtable = require('airtable');
const assert = require('assert');
// test base url: https://airtable.com/tblFcEbcgAlnEsx9U/viwj26rVGRkbsl6Fe?blocks=hide
// production base url: https://airtable.com/tblQjTFK3KpZxu61L/viw2dojPTqjU1UwGH?blocks=hide

assert.ok(process.env.AIRTABLE_BASE, "base must be set in .env");
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE);

module.exports = {
  Users:  base('Users'),
  OpenEvents: base('OpenEvents')
};