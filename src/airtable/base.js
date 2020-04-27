const Airtable = require('airtable');

// test base url: https://airtable.com/tblFcEbcgAlnEsx9U/viwj26rVGRkbsl6Fe?blocks=hide
// production base url: https://airtable.com/tblQjTFK3KpZxu61L/viw2dojPTqjU1UwGH?blocks=hide

const baseId = process.env.NODE_ENV === 'production' ? "app53ecZ2UL9M6JOw" : "appMlvxAhkLM3TbcL";
const base = new Airtable({ 
  apiKey: process.env.AIRBASE_API_KEY 
}).base(baseId);

module.exports = {
  Users:  base('Users'),
  OpenEvents: base('OpenEvents')
};