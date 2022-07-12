require('dotenv').config();

module.exports = {
  API_PORT: process.env.API_PORT,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  PINGXX_SECRET_KEY: process.env.PINGXX_SECRET_KEY,
  PINGXX_APP_ID: process.env.PINGXX_APP_ID,
  JWT_SECRET: process.env.JWT_SECRET,
  WX_LITE_APP_ID: process.env.WX_LITE_APP_ID,
  WX_LITE_APP_SECRET: process.env.WX_LITE_APP_SECRET,
};
