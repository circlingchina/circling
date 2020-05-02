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
    const isFull = this.getUsers().length >= this.rawJson.fields.MaxAttendees;
    return isFull;
  }

  //the field may not exist, return empty array instead of null
  getUsers() {
    return this.rawJson.fields.Users || [];
  }
  
  containsUser(userId) {
    return this.getUsers().includes(userId);
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
}

Event.Status =  {
  NOT_STARTED: "not_started",
  STARTING_SOON: "starting_soon",
  ONGOING: "ongoing",
  FINISHED: "finished"
};