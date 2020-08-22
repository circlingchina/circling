/**
 * A wrapper class around the user json
 * Example JSON:
    {
		"id": "3a680ae2-3c6c-4768-8295-59309106b9cf",
		"email": "ydatylmonv@gmail.com",
		"name": "Yiliang Tang",
		"sent_first_event_email": 1,
		"created_at": "2020-05-04T06:07:49.000Z",
		"mobile": "13122020190",
		"wechat_id": "ydatylmonvaaa",
		"premium_level": "1",
		"premium_expired_at": "2020-10-31T23:00:00.000Z"
	}
 */

export default class User {
  constructor(rawJson) {
    if(!('id' in rawJson)) {
      throw new Error("user must have id");
    }
    this.rawJson = rawJson;
  }

  id() {
    return this.rawJson.id;
  }
  
  isPremium() {
    const primiumLevelInt = parseInt(this.rawJson.premium_level);
    return primiumLevelInt >= 0 || this.rawJson.event_credit > 0;
  }

  canJoin(eventModel) {
    if (eventModel.isTrail()) {
      return true;
    }

    if (this.rawJson.premium_level === '0') {
      return this.rawJson.event_credit > 0 && eventModel.toJSON().category === 'Circling';
    }

    if (parseInt(this.rawJson.premium_level, 10) > 1) {
      return true;
    }

    // safe guard
    return false;
  }

  toJSON() {
    return this.rawJson;
  }
}
