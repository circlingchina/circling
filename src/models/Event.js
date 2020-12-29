/**
 * A wrapper class around the event json object returned from the airtabel API.
 * Example JSON:
        {
            "id": "25bd0fb0-267d-4a7c-bb1a-9be9a1f7d457",
            "name": "Circling",
            "max_attendees": 6,
            "category": "Circling",
            "host": "April",
            "event_link": "https://zhumu.me/j/154688134",
            "start_time": "2020-12-30T05:00:00.000Z",
            "fields": "{}",
            "end_time": "2020-12-30T06:00:00.000Z",
            "isInJoinableTimeFrame": true,
            "attendees": [
                {
                    "id": "c0ba8989-45a9-4e74-b908-2c6a55471bf0",
                    "email": "chenwu00@gmail.com",
                    "name": "陈陈陈"
                },
                {
                    "id": "672e3569-5277-41cf-ba02-7e11f2332ce4",
                    "email": "miao.sun.orange@gmail.com",
                    "name": "Mia"
                },
                {
                    "id": "5505d63d-0403-4c45-9491-2203624df277",
                    "email": "prettyfive@outlook.com",
                    "name": "prettyfive"
                },
                {
                    "id": "0fc9730f-4aa8-4135-a1f6-fe745e45aed7",
                    "email": "zha.jingcheng@gmail.com",
                    "name": "赵景程"
                },
                {
                    "id": "270294e4-0423-4fa9-b830-faea6c4b1378",
                    "email": "rosie.li.0519@gmail.com",
                    "name": "Rosie"
                },
                {
                    "id": "d2a1e393-385a-4d6a-9731-0baf7a64220c",
                    "email": "brief870@hotmail.com",
                    "name": "nicky San "
                }
            ]
        },
 */

import moment from 'moment-timezone';
import 'moment/locale/zh-cn';

import readableTimeString, {readableDate, readableTime} from "../utils/readableTimeString";

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

moment.locale('zh-cn');
export default class Event {
  constructor(rawJson) {
    if(!('id' in rawJson)) {
      throw new Error("event must have id");
    }
    this.rawJson = rawJson;
  }

  id() {
    return this.rawJson.id;
  }

  isFull() {
    return this.numAttendees() >= this.rawJson.max_attendees;
  }

  isEmpty() {
    return  this.numAttendees() === 0;
  }

  //the field may not exist, return empty array instead of null
  attendees() {
    return this.rawJson.attendees || [];
  }

  numAttendees() {
    return this.attendees().length;
  }

  isUserAttending(userId) {
    return this.attendees().map(u=>u.id).includes(userId);
  }

  startTimeDisplay() {
    return readableTimeString(this.rawJson.start_time);
  }

  endTimeDisplay() {
    return readableTimeString(this.rawJson.end_time);
  }

  durationDisplay() {
    const startTimeDate = readableDate(this.rawJson.start_time);
    const endTimeDate = readableDate(this.rawJson.end_time);

    if (startTimeDate === endTimeDate) {
      return this.startTimeDisplay() + " - " + readableTime(this.rawJson.end_time);
    }

    return this.startTimeDisplay() + " - " + this.endTimeDisplay();
  }

  isOfflineEvent() {
    return this.rawJson.category === '线下活动';
  }

  isTrail() {
    return this.rawJson.category === '新人介绍课程';
  }

  startingStatus() {

    let momentStartTime = moment.tz(this.rawJson.start_time, TIME_ZONE);
    const momentNow = moment.tz(new Date(), TIME_ZONE);

    let minutesUntil = moment.duration(momentStartTime.diff(momentNow)).asMinutes();

    if(minutesUntil > 1 * 60) {
      return Event.Status.NOT_STARTED;
    }
    if(minutesUntil > 15){
      return Event.Status.STARTING_SOON;
    }
    if(minutesUntil > -2 * 60) {
      return Event.Status.ONGOING;
    }
    return Event.Status.FINISHED;
  }

  isInJoinableTimeFrame() {
    return this.rawJson.isInJoinableTimeFrame || false;
  }

  isStartingSoon() {
    return this.startingStatus() == Event.Status.STARTING_SOON;
  }

  maxAttendees() {
    return this.rawJson.max_attendees;
  }

  toJSON() {
    return this.rawJson;
  }
}

Event.Status =  {
  NOT_STARTED: "not_started",
  STARTING_SOON: "starting_soon",
  ONGOING: "ongoing",
  FINISHED: "finished"
};
