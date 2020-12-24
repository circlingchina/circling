const {isBeforeAFutureTimeFromNow} = require('./timeUtils');
const moment = require('moment-timezone');

moment.locale('zh-cn');

const TIME_ZONE = 'Asia/Shanghai';


test("normal positive case, no round", () => {
  let now = new moment().tz(TIME_ZONE);
  let test = now.add(2, 'days');

  expect(isBeforeAFutureTimeFromNow(test, 3, 'days', false)).toBe(true);
});

test("normal negative case, no round", () => {
  let now = new moment().tz(TIME_ZONE);
  let test = now.add(2, 'days').add(1, 'seconds');

  expect(isBeforeAFutureTimeFromNow(test, 2, 'days', false)).toBe(false);
});

test("positive case when rounding to day", () => {
  let now = new moment().tz(TIME_ZONE);
  let test = now.add(2, 'days');

  expect(isBeforeAFutureTimeFromNow(test, 2, 'days', true)).toBe(true);
});
