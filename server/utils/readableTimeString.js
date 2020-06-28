const moment = require('moment-timezone');

moment.locale('zh-cn');

const TIME_ZONE = 'Asia/Shanghai';

function readableTimeString(datetime) {
  return moment(datetime).tz(TIME_ZONE).format("YYYY年M月D日（ddd）H点m分").replace(/点0分$/, '点');
}

module.exports = readableTimeString;
