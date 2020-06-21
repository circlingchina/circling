const debug = require("debug")("email");
const db = require("../db");
const {sentFirstEventEmail} = require('../emailService');
const readableTimeString = require('../utils/readableTimeString');

async function handleFirstJoinEmail(id, event_id) {
  debug("handling email stuff for user_id=", id);
  const user = await db("users").where({id}).limit(1).then((res)=>res[0]);
  debug({user});
  const event = await db("events").where({id: event_id}).limit(1).then((res)=>res[0]);
  debug({event});
  
  let sentMessageId = null;
  
  if (user && event && user.sent_first_event_email < 1) {
    const data = await sentFirstEventEmail(user.name, user.email, event.name, readableTimeString(event.start_time));
    sentMessageId = data.MessageId;
    debug({data, sentMessageId});
  }
  
  // update sent_first_event_email state
  if(sentMessageId) {
    await db("users").where({id}).update({sent_first_event_email: user.sent_first_event_email+1});
  }
}

// Find user by id
async function find(id) {
  const users = await db("users").where({id});
  if (users && users.length > 0) {
    return users[0];
  }
  return null;
}

module.exports = {
  handleFirstJoinEmail,
  find,
};
