require('dotenv').config();

const cryptoRandomString = require('crypto-random-string');
const _ = require("lodash");
const moment = require("moment");

const mainLogger = require("../logger");

const NAME = 'router.payment';
const logger = mainLogger.child({ label: NAME });
const debug = require("debug")(NAME);

const pingpp = require('pingpp')(process.env.PINGXX_SECRET_KEY);
// TODO: place the cert on server and remove it from the repo
pingpp.setPrivateKeyPath(__dirname + '/../certs/pingpp_merchant_pri.pem');

// We only have this channel for now （weixin H5）
const CHANNEL='wx_wap';

const CHARGE_TYPE_INFO = {
  SINGLE_EVENT: {
    subject: "单次活动",
    body: "单次活动",
    amount: 6900
  },
  MONTHLY: {
    subject: "月度会员",
    body: "月度会员",
    amount: 19900
  }, 
  HALF_YEAR: {
    subject: "半年度会员",
    body: "半年度会员",
    amount: 49900
  }
};

/* return example
{
  "charge":{
      "id":"ch_100200630126042511360008",
      "object":"charge",
      "created":1593458708,
      "livemode":false,
      "paid":false,
      "refunded":false,
      "reversed":false,
      "app":"app_brLuTGbXX9aHOCWb",
      "channel":"wx_wap",
      "order_no":"20200629173497535528",
      "client_ip":"::1",
      "amount":100,
      "amount_settle":100,
      "currency":"cny",
      "subject":"subject",
      "body":"body",
      "extra":{

      },
      "time_paid":null,
      "time_expire":1593465908,
      "time_settle":null,
      "transaction_no":null,
      "refunds":{
        "object":"list",
        "url":"/v1/charges/ch_100200630126042511360008/refunds",
        "has_more":false,
        "data":[

        ]
      },
      "amount_refunded":0,
      "failure_code":null,
      "failure_msg":null,
      "metadata":{

      },
      "credential":{
        "object":"credential",
        "wx_wap":"https://sissi.pingxx.com/mock.php?ch_id=ch_100200630126042511360008&channel=wx_wap"
      },
      "description":null
  }
}
*/
const createCharge = async(req, res) => {
  const body = req.body;
  debug(body);
  if (
    !_.isObject(body) || 
    _.isEmpty(body.user_id) || 
    _.isEmpty(body.charge_type) || 
    !_.includes(Object.keys(CHARGE_TYPE_INFO), body.charge_type)
  ) {
    res.status(400).type('json').send(JSON.stringify({err: "bad request"}));
    return;
  }
  
  // current date + 12 random numberic chars
  // TODO: check collision
  
  const order_no = moment(new Date()).format('YYYYMMDD') + cryptoRandomString({length: 12, type: 'numeric'});
  
  const user_id = body.user_id;
  // update db
  
  const params = {
    subject: CHARGE_TYPE_INFO[body.charge_type]['subject'],
    body: CHARGE_TYPE_INFO[body.charge_type]['body'],
    amount: CHARGE_TYPE_INFO[body.charge_type]['amount'],
    order_no,
    channel: CHANNEL,
    currency: "cny",
    client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    app: {id: process.env.PINGXX_APP_ID}
  };
  
  logger.info('create new charge with param', {params});
  
  pingpp.charges.create(params, (err, charge) => {
    if (err) {
      logger.info('err when creating charge', {err});
      debug(err);
      res
        .status(500)
        .type('json')
        .send(JSON.stringify(err.raw));
    } else {
      logger.info('charge created', {charge});
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
  
  if (
    !_.isObject(event) || 
    event.object !== 'event'||
    _.isEmpty(event.type) || 
    !_.isObject(event.data)
  ) {
    res.status(400).type('json').send(JSON.stringify({err: "bad request"}));
    return;
  }
  
  // https://help.pingxx.com/article/1021941/
  // TODO: need deduplication
  
  const eventType = event.type;
  
  if (eventType === 'charge.succeeded	') {
    logger.info('eventType is charge');
  }
  
  // DB update
  
  res.status(200).type('json').send(JSON.stringify({success: true}));
};

module.exports = (app) => {
  // TODO: use POST, called by client with credential
  app.post('/payment/charges', createCharge);
  app.post('/payment/pingppwebhook', pingppWebhook);
};
