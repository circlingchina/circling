require('dotenv').config();

const cryptoRandomString = require('crypto-random-string');
const _ = require("lodash");
const moment = require("moment");

const mainLogger = require("../logger");

const NAME = 'router.payment';
const logger = mainLogger.child({ label: NAME });
const debug = require("debug")(NAME);

const ChargeModel = require('../models/Charge');
const UserModel = require('../models/UserModel');

const pingpp = require('pingpp')(process.env.PINGXX_SECRET_KEY);
// TODO: place the cert on server and remove it from the repo
pingpp.setPrivateKeyPath(__dirname + '/../certs/pingpp_merchant_pri.pem');

// We only have this channel for now
const CHANNEL = {
  desktop: 'alipay_pc_direct',
  mobile: 'alipay_wap'
};

const CHARGE_TYPE_INFO = {
  SINGLE_EVENT: {
    subject: "单次活动",
    body: "单次活动",
    amount: 1
  },
  MONTHLY: {
    subject: "月度会员",
    body: "月度会员",
    amount: 2
  }, 
  HALF_YEAR: {
    subject: "半年度会员",
    body: "半年度会员",
    amount: 3
  },
  VIP: {
    subject: "亲密朋友",
    body: "特别会员",
    amount: 4
  }
};

const createCharge = async(req, res) => {
  const body = req.body;
  const chargeType = body.charge_type;
  const user_id = body.user_id;
  
  debug(body);
  if (
    !_.isObject(body) || 
    _.isEmpty(body.user_id) || 
    _.isEmpty(body.charge_type) || 
    !_.includes(Object.keys(CHARGE_TYPE_INFO), chargeType)
  ) {
    res.status(400).type('json').send(JSON.stringify({err: "bad request"}));
    return;
  }
  
  const channel = req.useragent.isDesktop ? CHANNEL.desktop : CHANNEL.mobile;
  
  // current date + 12 random numberic chars
  // TODO: check collision
  
  const order_no = moment(new Date()).format('YYYYMMDD') + cryptoRandomString({length: 12, type: 'numeric'});

  const params = {
    subject: CHARGE_TYPE_INFO[chargeType]['subject'],
    body: CHARGE_TYPE_INFO[chargeType]['body'],
    amount: CHARGE_TYPE_INFO[chargeType]['amount'],
    order_no,
    channel,
    currency: "cny",
    client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    app: {id: process.env.PINGXX_APP_ID},
    extra: {
      success_url: "https://www.circlingquanquan.com"
    }
  };
  
  logger.info('create new charge with param', {params});
  
  pingpp.charges.create(params, async (err, charge) => {
    if (err) {
      logger.info('err when creating charge', {err});
      debug(err);
      res
        .status(500)
        .type('json')
        .send(JSON.stringify(err.raw));
    } else {
      logger.info('charge created', {charge});
      await ChargeModel.createCharge(user_id, charge, chargeType);
      
      res
        .status(200)
        .type('json')
        .send(JSON.stringify({ charge }));
    }
  });
};

const pingppWebhook = async (req, res) => {
  res.status(200).send('pingxx pong');
  
  const event = req.body;
  logger.info('incoming event', {event});
  
  if (
    !_.isObject(event) || 
    event.object !== 'event'||
    _.isEmpty(event.type) || 
    !_.isObject(event.data)
  ) {
    res.status(400).type('json').send(JSON.stringify({err: "bad request"}));
    return;
  }
  
  // TODO: fetch and dedup
  // https://help.pingxx.com/article/1021941/
  const livemode = event.livemode;
  const eventType = event.type;
  
  logger.info(`livemode: ${livemode}, eventType: ${eventType}` );
  
  if (eventType === 'charge.succeeded') {
    const chargeId = event.data.object.id;
    
    await ChargeModel.handleChargeSucceededEvent(event);
    
    const charge = await ChargeModel.findByChargeId(chargeId); 
    logger.info("Charge updated", {charge});
    const userId = charge.user_id;
    const category = charge.category;
    
    await UserModel.enablePremium(userId, category);
    logger.info("User premium status updated", {userId, category}); 
  }
};

const pingppWebhookTest = async (req, res) => {
  res.status(200).send('pingxx test');
  
  const event = req.body;
  logger.info('incoming event test', {event});
  
};


module.exports = (app) => {
  // TODO: use POST, called by client with credential
  app.post('/payment/charges', createCharge);
  app.post('/payment/pingppwebhook', pingppWebhook);
  app.post('/payment/pingppwebhook_test', pingppWebhookTest);
};
