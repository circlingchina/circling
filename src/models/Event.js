export default class Event {
  constructor(rawJson) {
    this.rawJson = rawJson;
  }

  isFull() {
    return false;
  }
}