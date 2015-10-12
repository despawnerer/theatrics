import {EventEmitter} from 'events';


export default class Options extends EventEmitter {
  constructor() {
    super();
    this._options = this.getDefaults();
  }

  fetch() {
    return Promise.resolve(this);
  }

  get(key) {
    return this._options.get(key);
  }

  set(key, value) {
    this._options.set(key, value);
    this.emit('change', key, value);
  }

  getDefaults() {
    const options = new Map();
    options.set('location', 'spb');
    return options;
  }
}
