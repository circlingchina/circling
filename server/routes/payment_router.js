require('dotenv').config();

const cryptoRandomString = require('crypto-random-string');
const _ = require("lodash");
const passport = require("passport");
const moment = require("moment");

const mainLogger = require("../logger");

const NAME = 'router.payment';
const logger = mainLogger.child({ label: NAME });
const debug = require("debug")(NAME);

const ChargeModel = require('../models/Charge');
const UserModel = require('../models/UserModel');
const EmailService = require("../emailService");

const pingpp = require('pingpp')(process.env.PINGXX_SECRET_KEY);
// TODO: place the cert on server and remove it from the repo
pingpp.setPrivateKeyPath(__dirname + '/../certs/pingpp_merchant_pri.pem');

// We only have this channel for now
const CHANNEL = {
  desktop: 'alipay_pc_direct',
  mobile: 'alipay_wap'
};

const CHARGE_TYPE_INFO = {
  TINY_TEST: {
    subject: "内部测试",
    body: "内部测试",
    amount: 1,
  },
  SINGLE_EVENT: {
    subject: "单次活动",
    body: "单次活动",
    amount: 9900
  },
  MONTHLY: {
    subject: "月度会员",
    body: "月度会员",
    amount: 26900
  },
  // have changed this to SEASON -> 3 months
  HALF_YEAR: {
    subject: "季度会员",
    body: "季度会员",
    amount: 52000
  },
  VIP: {
    subject: "亲密朋友",
    body: "特别会员",
    amount: 500000
  }
};

const createCharge = async(req, res) => {
  const body = req.body;
  const chargeType = body.charge_type;
  const user_id = body.user_id;
  const req_channel = body.channel
  const open_id = body.open_id

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

  const channel = req_channel ? req_channel : (req.useragent.isDesktop ? CHANNEL.desktop : CHANNEL.mobile);

  // current date + 12 random numberic chars
  // TODO: check collision

  const order_no = moment(new Date()).format('YYYYMMDD') + cryptoRandomString({length: 12, type: 'numeric'});

  const extra = {}

  switch (channel) {
    case 'wx_lite':
      extra.open_id = open_id;
      break;
    default:
      extra.success_url = "https://www.circlingquanquan.com"
      break;
  }

  const params = {
    subject: CHARGE_TYPE_INFO[chargeType]['subject'],
    body: CHARGE_TYPE_INFO[chargeType]['body'],
    amount: CHARGE_TYPE_INFO[chargeType]['amount'],
    order_no,
    channel,
    currency: "cny",
    client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    app: {id: process.env.PINGXX_APP_ID},
    extra: extra
  };

  if (process.env.ENV == 'test') {
    params.amount = 2
  }

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
  const event = req.body;
  logger.info('incoming event', {event});
  // event example:
  // {
  //   id: 'evt_401210307054540914096706',
  //   created: 1615067140,
  //   livemode: true,
  //   type: 'charge.succeeded',
  //   data: {
  //     object: {
  //       id: 'ch_101210307212180285440005',
  //       object: 'charge',
  //       created: 1615067120,
  //       livemode: true,
  //       paid: true,
  //       refunded: false,
  //       reversed: false,
  //       app: 'app_brLuTGbXX9aHOCWb',
  //       channel: 'alipay_pc_direct',
  //       order_no: '20210306217198274881',
  //       client_ip: '::ffff:172.17.0.1',
  //       amount: 1,
  //       amount_settle: 1,
  //       currency: 'cny',
  //       subject: '单次活动',
  //       body: '单次活动',
  //       extra: {
  //         success_url: 'https://www.circlingquanquan.com',
  //         buyer_user_id: '2088102002878646',
  //         fund_bill_list: [ { amount: 1, fundChannel: 'ALIPAYACCOUNT' } ],
  //         receipt_amount: 1,
  //         buyer_pay_amount: 1
  //       },
  //       time_paid: 1615067139,
  //       time_expire: 1615153520,
  //       time_settle: null,
  //       transaction_no: '2021030722001478641451852493',
  //       refunds: {
  //         object: 'list',
  //         url: '/v1/charges/ch_101210307212180285440005/refunds',
  //         has_more: false,
  //         data: []
  //       },
  //       amount_refunded: 0,
  //       failure_code: null,
  //       failure_msg: null,
  //       metadata: {},
  //       credential: {},
  //       description: null
  //     }
  //   },
  //   object: 'event',
  //   request: 'iar_GOKybDrHaP8CrfnPK0POOeH8',
  //   pending_webhooks: 0
  // }

  if (
    !_.isObject(event) ||
    event.object !== 'event'||
    !_.isObject(event.data)
  ) {
    logger.info("return 400 for event");
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

    const user = await UserModel.find(userId);
    if (!user) {
      res.status(400).type('json').send(JSON.stringify({err: "user not found"}));
      return;
    }

    logger.info("first paid user", {user});

    await UserModel.enablePremium(userId, category);
    logger.info("User premium status updated", {userId, category});

    try {
      if (user && moment(user.premium_expired_at).isBefore('1980-01-01')) {
        const sendRet = await EmailService.sentFirstPaidEmail(user.name, user.email);
        logger.info("first paid send mail", {sendRet, email, data});
      }
    } catch {
      logger.info('fail to send First Paid email', {user});
    }

    res.status(200).send('pingxx success, ' + process.env.ENV);
    return
  }
  res.status(200).send('pingxx fail, ' + process.env.ENV);
};

const pingppWebhookTest = async (req, res) => {
  res.status(200).send('pingxx test');

  const event = req.body;
  logger.info('incoming event test', {event});
};


module.exports = (app) => {
  // TODO: use POST, called by client with credential
  // app.post('/payment/charges', passport.authenticate('jwt', { session: false }), createCharge);
  app.post('/payment/charges', createCharge);
  app.post('/payment/pingppwebhook', pingppWebhook);
  app.post('/payment/pingppwebhook_test', pingppWebhookTest);
};
