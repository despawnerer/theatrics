import {EventEmitter} from 'events';


export default class Settings extends EventEmitter {
  constructor() {
    super();
    this._settings = this.getDefaults();
  }

  fetch() {
    return Promise.resolve(this);
  }

  get(key) {
    return this._settings.get(key);
  }

  set(key, value) {
    if (this._settings.get(key) !== value) {
      this._settings.set(key, value);
      this.emit('change', key, value);
    }
  }

  getDefaults() {
    const settings = new Map();
    settings.set('location', 'spb');
    return settings;
  }
}
