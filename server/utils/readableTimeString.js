const moment = require('moment');

moment.locale('zh-cn');

function readableTimeString(datetime) {
  return moment(datetime).format("YYYY年M月D日（ddd）H点m分").replace(/点0分$/, '点');
}

module.exports = readableTimeString;
