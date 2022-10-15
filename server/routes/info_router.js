const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');

const InfoModel = require('../models/InfoModel');

const mainLogger = require("../logger");
const NAME = 'router.events';
const logger = mainLogger.child({ label: NAME });

const qaList = async (req, res) => {
  const qalist = await InfoModel.getQAList();
  if (!qalist || qalist.length == 0) {
    return res
    .type('json')
    .end(JSON.stringify(new Array()));
  }
  const posts = [];
  const object = {}
  qalist.forEach(post => {
    if (!object[post.subject]) object[post.subject] = []
    object[post.subject].push(post);
  });
  for (const subject in object) {
    if (Object.hasOwnProperty.call(object, subject)) {
      const item = {
        subject: subject,
        list: object[subject]
      }
      posts.push(item)
    }
  }

  return res
  .type('json')
  .end(JSON.stringify({
    posts
  }));
};

const qaContent = async (req, res) => {
  const qaId = req.params.id;
  const qa = await InfoModel.getQAContent(qaId);

  return res
  .type('json')
  .end(JSON.stringify(qa));
};

module.exports = (app) => {
    app.get('/info/qa', qaList);
    app.get('/info/qa/:id', qaContent);
  };