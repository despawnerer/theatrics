import {EventEmitter} from 'events';


export default class Query extends EventEmitter {
  constructor(path, params) {
    super();
    this._path = path;
    this._params = params;
    this._locked = 0;
  }

  get params() {
    return this._params;
  }

  get path() {
    return this._path;
  }

  lock() {
    this._locked += 1;
    return this;
  }

  apply() {
    this._locked -= 1;
    this._maybeNotify();
    return this;
  }

  set(key, value) {
    this._params[key] = value;
    this._maybeNotify();
    return this;
  }

  remove(...keyList) {
    for (let key of keyList) {
      delete this._params[key];
    }
    this._maybeNotify();
    return this;
  }

  _maybeNotify() {
    if (this._locked == 0) {
      this.emit('update');
    }
  }
}