require("dotenv").config();
let Airtable = require('airtable');
const _ = require('lodash');
console.log("connecting to base ", process.env.AIRTABLE_BASE);
let base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

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

const LIMIT = 500;
const user_uuids = {};
const numAttendees = {};

async function insertEvent(record) {
  
  // const events = await knex('events');
  const e = record.fields;
  let jsonbFields = _.pick(e, ["OfflineEventAddress", "OfflineEventExtra", "OfflineEventContact"]);
  jsonbFields = _.mapKeys(jsonbFields, (v, k) => {
    return _.snakeCase(k);
  });
  console.log(jsonbFields);
  const query = knex('events').insert({
    name: e.Name,
    max_attendees: e.MaxAttendees,
    host: e.Host,
    event_link: e.EventLink,
    category: e.Category,
    start_time: e.Time,
    fields: JSON.stringify(jsonbFields)
  }).returning('id');
    // console.log("query=", query);
  const res = await query.then();
  numAttendees[res[0]] = e.Attendees;
  const attending_users = record.fields.Users;
  // console.log(record.fields.Users);
  if(attending_users && LIMIT > 100) {
    for (const user of attending_users) {
      // console.log(user);
      await joinEvent(user_uuids[user], res[0]);
    }
  }
  // console.log(queryRes);
  
}

async function joinEvent(user_uuid, event_uuid) {
  // console.log(`user ${typeof user_uuid} joining event ${event_uuid}`);
  return knex('user_event').insert({
    user_id: user_uuid,
    event_id: event_uuid
  });
}


async function loadEvents() {
  const records = await base('OpenEvents')
    .select({ maxRecords: LIMIT }).all();
  
  try {
    for (const record of records) {
      await insertEvent(record);
    }
  }
  catch (error) {
    console.error("error caught", error);
  }
}

async function loadUsers() {
  const users = await base('Users').select({
    filterByFormula: "NOT({email} = '')",
    maxRecords: LIMIT,
  }).all();
  try {
    for (const record of users) {
      const user = record._rawJson.fields;
      await insertUser(user);
    }
    console.log("inserted all users");
  }
  catch (error) {
    console.error("error caught", error);
    throw error;
  }
}

async function insertUser(user) {
  // console.log("insert user", user);
  const query = knex('users').insert({
    name: user.Name,
    email: user.email,
    sent_first_event_email: user.sentFirstEventEmail,
    created_at: user.created_at,
    mobile: user.Mobile,
    wechat_id: user.WechatUserName
  }).returning('id');
  const uuid = await query.then();
  user_uuids[user._recordId] = uuid[0];
  return uuid;
}

async function checkAttendees() {
  for (const entry in numAttendees) {
    console.log(entry, numAttendees[entry]);
  }
}

loadUsers()
  .then(()=> {
    return loadEvents();
  })
  .then(() => {
    checkAttendees();
  }).finally(()=> {
    knex.destroy();
  });