const debug = require("debug")("email");
const db = require("../db");
const {sentFirstEventEmail} = require('../emailService');

async function handleFirstJoinEmail(id) {
  debug("handling email stuff for user_id=", id);
  const user = await db("users").where({id}).limit(1).then((res)=>res[0]);
  debug({user});
  let sentMessageId = null;
  if(user.sent_first_event_email < 1) {
    const data = await sentFirstEventEmail(user.name, user.email);
    sentMessageId = data.MessageId;
    debug({data, sentMessageId});
  }

  // update sent_first_event_email state
  if(sentMessageId) {
    await db("users").where({id}).update({sent_first_event_email: user.sent_first_event_email+1});
  }
}

module.exports = {
  handleFirstJoinEmail,
};