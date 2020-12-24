const moment = require('moment-timezone');

moment.locale('zh-cn');

const TIME_ZONE = 'Asia/Shanghai';

function readableTimeString(datetime) {
  return moment(datetime).tz(TIME_ZONE).format("YYYY年M月D日（ddd）H点m分").replace(/点0分$/, '点');
}

// return true if the given datetime is before (now + the given unit of amount)
function isBeforeAFutureTimeFromNow(datetime, amount, unit, roundToDay) {
  const now = new moment().tz(TIME_ZONE);

  let target = now.add(amount, unit);
  if (roundToDay && (target.hours() !== 0 || target.minutes() !== 0 || target.seconds() !== 0 || target.millisecond() !== 0)) {
    target.add(1, 'days');
    target.startOf('day');
  }

  return moment(datetime).tz(TIME_ZONE).isBefore(target);
}

module.exports = {
  readableTimeString,
  isBeforeAFutureTimeFromNow
};
