/**
 * A wrapper class around the event json object returned from the airtabel API.
 * Example JSON:

    {
      "id": "dd11034a-9e89-4e83-8434-a5df05ddfd92",
      "name": "杭州线下活动",
      "max_attendees": 11,
      "category": "线下活动",
      "host": "Jess"
    }

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
