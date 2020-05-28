require("dotenv").config();
let Airtable = require('airtable');
console.log("logging in with key ", process.env.AIRTABLE_API_KEY);
let base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base('appMlvxAhkLM3TbcL');

let knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port: '5555',
    user : 'circling',
    password : 'circling',
    database : 'circling_db'
  }
});

async function insertEvent(record) {
  // const events = await knex('events');
  console.log("record", record.fields);
  const e = record.fields;
  const query = knex('events').insert({
    name: e.Name,
    max_attendees: e.MaxAttendees,
    host: e.Host,
    event_link: e.EventLink,
    category: e.Category,
    start_time: e.Time
  });
    // console.log("query=", query);
  const queryRes = await query.limit(10);
  console.log(queryRes);
  
}


async function loadEvents() {
  const records = await base('OpenEvents').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
  }).all();
  
  try {
    for (const record of records) {
      await insertEvent(record);
    }
  }
  catch (error) {
    console.error("error caught", error);
  }
}

loadEvents().then(()=> {
  knex.destroy();
});