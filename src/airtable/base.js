const Airtable = require('airtable');

const base = new Airtable({ 
    apiKey: process.env.AIRBASE_API_KEY 
}).base("app53ecZ2UL9M6JOw");

module.exports = {
    Users:  base('Users'),
    OpenEvents: base('OpenEvents')
};
