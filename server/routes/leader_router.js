const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const passport = require("passport");

const UserModel = require('../models/UserModel');
const Event = require('../models/Event');

const e = require('express');
const { forEach } = require('lodash');

const mainLogger = require("../logger");
const NAME = 'router.leader';
const logger = mainLogger.child({ label: NAME });
const debug = require("debug")(NAME);

const uploadEvent = async(req, res) => {
  const { name, category, max_attendees, start_at, end_at, is_trainee, supervisor } = req.body;
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  let user = await UserModel.find(user_id);
  const start = new Date(Number(start_at));
  const end = new Date(Number(end_at));
  const now = new Date();

  logger.info('uploadEvent', {name, category, max_attendees, start_at, end_at, is_trainee, supervisor, start, end, user_id});

  let host = user.name;
  if (is_trainee) {
    host = "见习带领：" + user.name + "（" + supervisor + "协助）";
  }

  // 判断参数是否正常
  // 名称、活动类型、最大人数、时间
  if (!name) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40070,
      message: '活动名称有误'
    }));
  }
  if (category != "Circling" && category != "Circling周边游戏" && category != "社群活动" && category != "内部活动") {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40071,
      message: '活动类型有误'
    }));
  }
  if (max_attendees <= 0) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40072,
      message: '人数上限有误'
    }));
  }
  if (!start_at || !end_at) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40073,
      message: '时间有误'
    }));
  }
  if (start >= end) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40075,
      message: '结束时间需大于开始时间'
    }));
  }
  if (end < now) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40076,
      message: '结束时间需大于当前时间'
    }));
  }

  // 判断活动是否预定满
  // 分为三个时段03:00-12:00、12:00-18:00、18:00-03:00，分别最多能存在2、2、3场活动
  const start_hour = moment(start).utcOffset(8).hour();
  let period_start = moment(start).utcOffset(8).minutes(0).seconds(0).milliseconds(0);
  let period_end = moment(period_start).utcOffset(8);
  let max_events = 0;
  if (start_hour >= 3 && start_hour < 12) {
    period_start.hour(3);
    period_end.hour(12);
    max_events = 2;
  } else if (start_hour >= 12 && start_hour < 18) {
    period_start.hour(12);
    period_end.hour(18);
    max_events = 2;
  } else if (start_hour >= 0 && start_hour < 3) {
    period_start.add(-1, 'd').hour(18);
    period_end.hour(3);
    max_events = 3;
  } else {
    period_start.hour(18);
    period_end.add(1, 'd').hour(3);
    max_events = 3;
  }

  const events = await Event.getEventByTime(period_start, period_end);

  logger.info('分配账号', {
    start: moment(start).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
    start_hour,
    period_start: moment(period_start).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
    period_end : moment(period_end).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
    max_events,
    events
  });

  if (events.length >= max_events) {
    return res.status(400).type('json').send(JSON.stringify({
             error_code: 40074,
             message: '当前时段已约满' + max_events + '场，请选择其他时段'
           }))
  }

  // 获取活动链接
  const accounts = await getEventAccounts();
  let account = null;
  for (let i = 0; i < accounts.length; i++) {
    if (!events.some(event => event.event_link == accounts[i].link)) {
      account = accounts[i];
      break;
    }
  }

  // 计算开放时间
  // 获取本周开始时间
  let start_of_week = moment(start).utcOffset(8).day(1);
  if (start_of_week.isAfter(moment(start))) {
    start_of_week.add(-1, 'w');
  }
  let open_time = moment(start_of_week).hour(0).minute(0).second(0).millisecond(0).add(-6, 'h');

  logger.info('计算开放时间', {
    start_of_week,
    open_time
  });

  // 插入数据库
  await Event.uploadEvent(name, max_attendees, category, host, account.link, account.name, start, end, user_id, supervisor, open_time)

  // 返回结果
  const obj = {
    name: name,
    category: category,
    host: host,
    max_attendees: max_attendees,
    start_time: start, // 2023-02-27 20:00:00
    end_time: end, // 2023-02-27 21:00:00
    supervisor: supervisor,
    event_account: account.name,
    event_link: account.link,
    open_time
  };
  return res
  .type('json')
  .end(JSON.stringify(obj));
}

const getEvent = async(req, res) => {
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  const start = new Date();
  const end = new Date(start.getFullYear()+1, start.getMonth()+1, start.getDate());
  const events = await Event.getEventByLeaderId(user_id, start, end);

  return res
  .type('json')
  .end(JSON.stringify({events: events}));
}

async function getEventAccounts() {
  const accounts_str = process.env.EVENT_ACCOUNTS;
  const items = accounts_str.split(";");
  const accounts = [];
  items.forEach(acc_str => {
    const acc = acc_str.split(",");
    accounts.push(
      {
        link: acc[0],
        name: acc[1]
      }
    )
  });
  return accounts;
}

module.exports = (app) => {
  app.post('/leader/uploadEvent', passport.authenticate('jwt', { session: false }), uploadEvent);
  app.get('/leader/getEvent', passport.authenticate('jwt', { session: false }), getEvent);
};