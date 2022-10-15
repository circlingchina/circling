const _ = require("lodash");
const db = require("../db");
const moment = require('moment');

async function getQAList() {
  return db("qa_post").select('id', 'subject', 'title', 'update_at', 'sort').orderBy('sort');
}

async function getQAContent(id) {
  const qa = await db("qa_post").where({ id: id });
  if (qa && qa.length > 0) {
    return qa[0];
  }
  return null;
}

module.exports = {
  getQAList,
  getQAContent,
};
  