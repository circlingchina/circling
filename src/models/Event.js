/**
 * A wrapper class around the event json object returned from the airtabel API.
 * Example JSON:
 *  {
      "id": "recKj8lRP6ZSOBfvl",
      "fields": {
        "Name": "Circling 周二会员活动",
        "Time": "2020-05-28T13:00:00.000Z",
        "MaxAttendees": 7,
        "Category": "每日Circling",
        "Host": "Mint (DEV)",
        "Users": [
          "recIdsEqRLNV52zPC"
        ],
        "EventLink": "https://zhumu.me/j/1516471967"
      }
    }
 */

import readableTimeString from "../utils/readableTimeString";

export default class Event {
  constructor(rawJson) {
    if(!('id' in rawJson)) {
      throw new Error("event must have id");
    }
    if(!('fields' in rawJson)) {
      throw new Error("event must have fields");
    }
    this.rawJson = rawJson;
  }

  isFull() {
    return this.getUsers().length >= this.rawJson.fields.MaxAttendees;
  }

  isEmpty() {
    return  this.getUsers().length === 0;
  }

  //the field may not exist, return empty array instead of null
  getUsers() {
    return this.rawJson.fields.Users || [];
  }

  containsUser(userId) {
    return this.getUsers().includes(userId);
  }

  startTimeDisplay() {
    return readableTimeString(this.rawJson.fields.Time);
  }

  isOfflineEvent() {
    return this.toJSON().fields.Category === '线下活动';
  }

  startingStatus() {
    const msDiff = new Date(this.rawJson.fields.Time) - new Date();
    const minutesUntil = msDiff / 1000 / 60;

    if(minutesUntil > 2 * 60) {
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
