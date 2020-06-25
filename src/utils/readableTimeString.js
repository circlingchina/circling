import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

export default function readableTimeString(datetime) {
  return moment(datetime).format("YYYY年M月D日（ddd）H点m分").replace(/点0分$/, '点');
}

export function readableTime(datetime) {
  return moment(datetime).format("H点m分").replace(/点0分$/, '点');
}

export function readableDate(datetime) {
  return moment(datetime).format("YYYY年M月D日");
}
