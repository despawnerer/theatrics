export default class Event {
	constructor(data) {
		this.data = data;
	}

	stringify() {
		return JSON.stringify(this.data);
	}
}
