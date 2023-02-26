const _ = require('lodash');
const passport = require('passport');
const debug = require("debug")("server-debug");
const Event = require('../models/Event');
const UserModel = require('../models/UserModel');
const moment = require('moment');
const axios = require('axios');

const mainLogger = require("../logger");
const { Console } = require('winston/lib/winston/transports');
const NAME = 'router.events';
const logger = mainLogger.child({ label: NAME });

require('dotenv').config();

const eventWithExtraFields = async(event) => {
  if (!_.isEmpty(event.fields)) {
    const fieldsObj = event.fields;
    if (fieldsObj.offline_event_contact) {
      fieldsObj.offline_event_contact = await UserModel.find(fieldsObj.offline_event_contact);
    }
    Object.assign(event, {fields: fieldsObj});
  }

  let isInJoinableTimeFrame = false;
  if (Event.isInJoinableTimeFrame(event)) {
    isInJoinableTimeFrame = true;
  }
  Object.assign(event, { isInJoinableTimeFrame });

  return event;
};

const eventAttendedStatus = async(events, user_id) => {
  if (events && events.length > 0) {
    for (const event of events) {
      const attendees = await Event.attendees(event.id);
      Object.assign(event, {attendees});

      let event_status = 0;
      if (attendees && attendees.length >= event.max_attendees) {
        event_status = 1;
      }
      Object.assign(event, {event_status});
      await eventWithExtraFields(event);

      let attend_status = -1
      if (user_id) {
        const user = await UserModel.find(user_id)
        if (user) {
          attend_status = 0;
          if (attendees && attendees.some(attendee => attendee.id == user.id)) {
            attend_status += 1;
          }
          if (await Event.isSubscribed(event.id, user_id)) {
            attend_status += 2;
          }
        }
      }
      Object.assign(event, {attend_status});
    }
  }
  return events;
}

const upcoming = async (req, res) => {
  try {
    const user_id = req.query.token;
    const events = await Event.upcoming();
    await eventAttendedStatus(events, user_id);

    res
      .type('json')
      .end(JSON.stringify({events: events}));

  } catch (error) {
    return res.status(500).end();
  }
};

const nextTrail = async(req, res) => {
  try {
    const event = await Event.nextTrail();
    res
      .type('json')
      .end(JSON.stringify(event));
  } catch (error) {
    return res.status(500).end();
  }
};

const join = async (req, res) => {

  const eventId = req.params.id;
  const userId = req.query.user_id;

  const event = await Event.find(eventId, {includeAttendees: true});

  if (!event) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'Event not found',
        error_code: 40030,
        message: 'Event not found'
      }));
    return;
  }

  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach(e => {
      if (e.id == userId) {
        res
          .status(400)
          .type('json')
          .send(JSON.stringify({
            error_code: 40030,
            message: 'Already participated'
          }));
        return
      }
    });
  }

  if (event.attendees.length >= event.max_attendees) {
    res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        result: false,
        err: 'event is full',
        error_code: 40031,
        message: 'Event is full'
      }));
    return;
  }

  const canJoin = await UserModel.canJoin(userId, eventId);
  if (!canJoin) {
    const isTicketUsedUp = await UserModel.isTicketUsedUp(userId, eventId);
    if (isTicketUsedUp) {
      return res
        .status(400)
        .type('json')
        .send(JSON.stringify({
          error_code: 40034,
          message: 'No ticket'
        }));
    } else {
      return res
        .status(400)
        .type('json')
        .send(JSON.stringify({
          result: false,
          err: 'invalid user id',
          error_code: 40032,
          message: 'Insufficient privileges'
        }));
    }
  }

  const attendedEvents = await Event.attendedEventsByUserId(userId);
  if (attendedEvents && attendedEvents.length >= 2) {
    return res
      .status(400)
      .type('json')
      .send(JSON.stringify({
        error_code: 40035,
        message: 'Attend too many'
      }));
  }

  const queryRes = await Event.join(eventId, userId);
  await UserModel.afterJoin(userId);

  //optionally see if email needs to be sent
  await UserModel.handleFirstJoinEmail(userId, eventId);
  const updatedEvent = await Event.find(eventId, {includeAttendees: true});
  await eventWithExtraFields(updatedEvent);
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: queryRes,
      event: updatedEvent
    }));
};

const unjoin = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.query.user_id;
  debug({userId, eventId});

  const queryRes = await Event.unjoin(eventId, userId);
  await UserModel.afterUnjoin(userId);
  const updatedEvent = await Event.find(eventId, {includeAttendees: true});
  await eventWithExtraFields(updatedEvent);
  await notifyEvent(eventId);
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      result: queryRes,
      event: updatedEvent
    }));
};

const subscribe = async (req, res) => {
  // 判断user_id是否正确
  const jwt_user_id = req.user.id;
  const user_id = req.query.user_id;
  if (!user_id || user_id != jwt_user_id) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40051,
      message: 'UserID error'
    }));
  }
  // 判断open_id
  const open_id = req.query.open_id;
  if (!open_id) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40054,
      message: 'Openid is null'
    }));
  }
  // 判断event是否为空
  const event_id = req.params.id;
  const event = await Event.find(event_id, {includeAttendees: true});
  if (!event) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40050,
      message: 'Event not found'
    }));
  }
  // 判断用户是否可以订阅（只有会员、有单次活动体验次数的用户才能订阅）
  const canSubscribe = await UserModel.canSubscribe(user_id, event_id);
  if (!canSubscribe) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40056,
      message: 'Insufficient privileges'
    }));
  }
  // 判断活动是否可以订阅，开始前两小时内无法订阅
  if (moment().isAfter(moment(event.start_time).add(-2, 'hours'))) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40052,
      message: 'Event is not subscribeable'
    }));
  }
  // 判断活动是否未满员
  let attendNum = 0;
  if (event.attendees) {
    attendNum = event.attendees.length;
  }
  if (attendNum < event.max_attendees) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40053,
      message: 'Event is not full'
    }));
  }
  // 判断是否已经订阅
  if (await Event.isSubscribed(event_id, user_id)) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40055,
      message: 'Event is subscribed'
    }));
  }
  // 保存用户open_id
  await UserModel.updateOpenId(user_id, open_id);
  // 插入订阅表
  // todo: 判断订阅是否成功
  await Event.subscribe(event_id, user_id, open_id);

  return res.status(200).type('json').send(JSON.stringify({
    event
  }));
}

const unsubscribe = async (req, res) => {
  // 判断user_id是否正确
  const jwt_user_id = req.user.id;
  const user_id = req.query.user_id;
  if (!user_id || user_id != jwt_user_id) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40061,
      message: 'UserID error'
    }));
  }
  // 判断event是否为空
  const event_id = req.params.id;
  const event = await Event.find(event_id, {includeAttendees: true});
  if (!event) {
    return res.status(400).type('json').send(JSON.stringify({
      error_code: 40060,
      message: 'Event not found'
    }));
  }
  await Event.unsubscribe(event_id, user_id);
  return res.status(200).type('json').send(JSON.stringify({
    event
  }));
}

const statistics = async (req, res) => {
  const nowTimeStamp = (new Date()).getTime();
  const user_id = req.user.id;
  const start_at = req.query.start_at || 1577808000000;
  const end_at = Math.min((req.query.end_at || nowTimeStamp), nowTimeStamp);
  const start = new Date(Number(start_at));
  const end = new Date(Number(end_at));

  console.log(req.query.end_at);
  console.log(nowTimeStamp);
  console.log(end_at);
  console.log(end);

  const stats = await Event.getStatistics(user_id, start, end);
  res
    .status(200)
    .type('json')
    .send(JSON.stringify({
      event_num: stats.event_num,
      circling_num: stats.circling_num,
      companions: stats.companions
    }));
};

const history = async (req, res) => {
  const count = parseInt(req.query.count || 10);
  const offset = parseInt(req.query.offset || 0);
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  const events = await Event.historyByUserId(user_id, count + 1, offset);
  let is_last_page = true
  if (!events) {
    return res.status(200).type('json').send(JSON.stringify({
      events: []
    }));
  }
  if (events.length > count) {
    is_last_page = false
    events.pop();
  }
  await eventAttendedStatus(events, user_id);
  const now = new Date();
  console.log(events[0].start_time, now)
  return res.status(200).type('json').send(JSON.stringify({
    is_last_page: is_last_page,
    count,
    offset,
    events: events.filter(x => x.start_time <= now)
  }));
};

const attended = async (req, res) => {
  const jwt_user = req.user;
  const user_id = jwt_user.id;
  const events = await Event.attendedEventsByUserId(user_id);
  if (!events) {
    return res.status(200).type('json').send(JSON.stringify({
      events: []
    }));
  }
  await eventAttendedStatus(events, user_id);
  return res.status(200).type('json').send(JSON.stringify({
    events: events ? events : []
  }));
};

const notifyEvent = async(event_id) => {
  const event = await Event.find(event_id);
  const sub_users = await Event.getSubscribeUsers(event.id);
  if (sub_users && sub_users.length > 0) {
    for (const sub_user of sub_users) {
      const notifyResult = await notify(event, sub_user.open_id);
      const content = JSON.stringify(notifyResult.data);
      const result = JSON.stringify(notifyResult.res);
      logger.info("notify log", {event_id:sub_user.event_id, user_id:sub_user.user_id, status:1, content, result});
      await Event.updateSubscribe(sub_user.event_id, sub_user.user_id, 1, content, result);
    }
  }
}

const notify = async(event, open_id) => {
  let notifyResult = {}
  const access_token = await getWxAccessToken();
  if (access_token) {
    const template_data = {
      thing1: { // 活动名称
        value: event.name
      },
      thing5: { // 类型
        value: event.category
      },
      time2: { // 活动时间
        value: moment(event.start_time).utcOffset(8).format('YYYY年M月D日 HH:mm') + '~' + moment(event.end_time).utcOffset(8).format('YYYY年M月D日 HH:mm')
      },
      short_thing3: { // 活动状态
        value: "可报名"
      },
      thing4: { // 温馨提示
        value: "您订阅的活动已空出名额，可点击跳转报名"
      },
    };
    const data = {
      url: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
      method: 'post',
      params: {
        access_token: access_token
      },
      data: {
        access_token: access_token,
        touser: open_id,
        template_id: process.env.WX_LITE_APP_PUSH_CANJOIN_TEMPLATEID,
        page: 'pages/home/index',
        lang:"zh_CN",
        miniprogram_state: process.env.WX_LITE_APP_PUSH_STATE,
        data: template_data
      }
    };
    notifyResult.data = data;
    const res = await axios(data);
    notifyResult.res = res.data;
    return notifyResult;
  }
  return notifyResult;
}

// todo: 后面微信相关的可以放到一个文件中
const getWxAccessToken = async() => {
  const res = await axios({
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    method: 'get',
    params: {
      grant_type: 'client_credential',
      appid: process.env.WX_LITE_APP_ID,
      secret: process.env.WX_LITE_APP_SECRET
    }
  })
  if (res.status == 200 && !!res.data) {
    return res.data.access_token;
  }
}

module.exports = (app) => {
  app.get('/events', upcoming);
  app.get('/events/:id/join', passport.authenticate('jwt', { session: false }), join);
  app.get('/events/:id/unjoin', passport.authenticate('jwt', { session: false }), unjoin);
  app.get('/events/:id/subscribe', passport.authenticate('jwt', { session: false }), subscribe);
  app.get('/events/:id/unsubscribe', passport.authenticate('jwt', { session: false }), unsubscribe);
  app.get('/events/nextTrail', nextTrail);
  app.get('/events/statistics', passport.authenticate('jwt', { session: false }), statistics);
  app.get('/events/history', passport.authenticate('jwt', { session: false }), history);
  app.get('/events/attended', passport.authenticate('jwt', { session: false }), attended);
};
