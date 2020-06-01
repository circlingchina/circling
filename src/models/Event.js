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

import readableTimeString from "../utils/readableTimeString";

export default class Event {
  constructor(rawJson) {
    if(!('id' in rawJson)) {
      throw new Error("event must have id");
    }
    this.rawJson = rawJson;
  }

  isFull() {
    return this.getUsers().length >= this.rawJson.max_attendees;
  }

  isEmpty() {
    return  this.getUsers().length === 0;
  }

  //the field may not exist, return empty array instead of null
  getUsers() {
    return this.rawJson.users || [];
  }

  containsUser(userId) {
    return this.getUsers().includes(userId);
  }

  startTimeDisplay() {
    return readableTimeString(this.rawJson.start_time);
  }

  isOfflineEvent() {
    return this.toJSON().category === '线下活动';
  }

  startingStatus() {
    const msDiff = new Date(this.rawJson.start_time) - new Date();
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
  
  users() {
    return []; // TODO - return users from db 
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
