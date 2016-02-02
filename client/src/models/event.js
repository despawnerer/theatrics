export default class Event {
  constructor(data) {
    this.data = data;
  }

  toJSON() {
    return this.data;
  }
}
