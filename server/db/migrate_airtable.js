require("dotenv").config();
const debug = require("debug")("migrate");
const debug_join = require("debug")("join");
const EventModel = require("../models/Event");
let Airtable = require('airtable');
const _ = require('lodash');
let base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

let knex = require('./index');

const LIMIT = 500;
const user_uuids = {};
const numAttendees = {};

async function insertEvent(record) {
  // const events = await knex('events');
  const e = record.fields;
  
  // skip events without start-time
  if(!e.Time) {
    console.info(`skipped ${e.Name}`);
    return;
  }
  let jsonbFields = _.pick(e, ["OfflineEventAddress", "OfflineEventExtra", "OfflineEventContact"]);
  jsonbFields = _.mapKeys(jsonbFields, (v, k) => {
    return _.snakeCase(k);
  });
  if (Array.isArray(jsonbFields.offline_event_contact) && jsonbFields.offline_event_contact.length > 0) {
    jsonbFields.offline_event_contact = user_uuids[jsonbFields.offline_event_contact[0]];
  }

  const query = knex('events').insert({
    name: e.Name,
    max_attendees: e.MaxAttendees,
    host: e.Host,
    event_link: e.EventLink,
    category: e.Category,
    start_time: e.Time,
    fields: JSON.stringify(jsonbFields)
  }).returning('id');
    // log("query=", query);
  const res = await query.then();

  debug({jsonbFields, id: res[0]});
  numAttendees[res[0]] = e.Attendees;
  const attending_users = record.fields.Users;
  debug_join(record.fields);
  debug_join(record.fields.Users);
  if(attending_users) {
    for (const user of attending_users) {
      // log(user);
      await joinEvent(user_uuids[user], res[0]);
    }
  }
  // log(queryRes);

}

async function joinEvent(user_uuid, event_uuid) {
  debug_join(`user ${user_uuid} joining event ${event_uuid}`);
  EventModel.join(event_uuid, user_uuid);
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
    console.error("loadEvents Error", error);
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
    debug("inserted all users");
  }
  catch (error) {
    console.error("error caught", error);
    throw error;
  }
}

async function insertUser(user) {
  // log("insert user", user);
  const query = knex('users').insert({
    name: user.Name,
    email: user.email,
    sent_first_event_email: user.sentFirstEventEmail,
    created_at: user.created_at,
    mobile: user.Mobile,
    wechat_id: user.WechatUserName
  }).returning('id');
  try {
    const uuid = await query.then();
    user_uuids[user._recordId] = uuid[0];
    return uuid;

  } catch (error) {
    debug("error, skipping", error);
    return null;
  }
}

async function checkAttendees() {
  for (const entry in numAttendees) {
    debug(entry, numAttendees[entry]);
  }
}

loadUsers()
  .then(()=> {
    return loadEvents();
  })
  .then(() => {
    checkAttendees();
  })
  .catch(err => {
    debug('err', err);
  })
  .finally(()=> {
    knex.destroy();
  });
