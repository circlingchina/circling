import moment from "moment";
import "moment/locale/zh-cn";

moment.locale("zh-cn");

export const TIME_ZONE = "Asia/Shanghai";

export default function readableTimeString(datetime) {
  return moment(datetime)
    .tz(TIME_ZONE)
    .format("YYYY年M月D日（ddd）H点m分")
    .replace(/点0分$/, "点");
}

export function readableTime(datetime) {
  return moment(datetime)
    .tz(TIME_ZONE)
    .format("H点m分")
    .replace(/点0分$/, "点");
}

export function readableDate(datetime) {
  return moment(datetime).tz(TIME_ZONE).format("YYYY年M月D日");
}

export const getMoment = (timezone = TIME_ZONE) => {
  const m = (...args) => moment.tz(...args, timezone);
  m.localeData = moment.localeData;
  return m;
};
