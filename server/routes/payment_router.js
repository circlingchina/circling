require('dotenv').config();

const crypto = require("crypto");

const debug = require("debug")("server-debug");
const pingpp = require('pingpp')(process.env.PINGXX_SECRET_KEY);

// TODO: place the cert on server and remove it from the repo
pingpp.setPrivateKeyPath(__dirname + '/../certs/pingpp_merchant_pri.pem');

// We only have this channel for now （weixin H5）
const CHANNEL='wx_wap';

const createCharge = async(req, res) => {
    
  const order_no = crypto.randomBytes(20).toString('hex');
    
  const params = {
    subject: "subject",
    body: "body",
    amount: 100,
    order_no: order_no,
    channel: CHANNEL,
    currency: "cny",
    client_ip: "127.0.0.1",
    app: {id: process.env.PINGXX_APP_ID}
  };
  
  debug(params);
  
  pingpp.charges.create(params, (err, charge) => {
    if (err) {
      debug(err);
      res
        .status(500)
        .type('json')
        .send(JSON.stringify(err.raw));
    } else {
      res
        .status(200)
        .type('json')
        .send(JSON.stringify({
          charge
        }));
    }
  });

};

module.exports = (app) => {
  // TODO: use POST, called by client with credential
  app.get('/payment/charges', createCharge);
};
