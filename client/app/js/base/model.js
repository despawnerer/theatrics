import {EventEmitter} from 'events';

import extend from 'xtend';


export default class Model extends EventEmitter {
  constructor(data) {
    super();
    this._data = data;
    this._locked = 0;
    this._previousData = extend(data);
  }

  static from(otherModel) {
    return new this(extend(otherModel.data));
  }

  get data() {
    return this._data;
  }

  get previousData() {
    return this._previousData;
  }

  clone() {
    return new this.constructor(extend(this._data));
  }

  fetch() {
    return Promise.resolve(this);
  }

  // locking

  lock() {
    this._locked += 1;
    return this;
  }

  apply() {
    this._locked -= 1;
    this._maybeNotify();
    return this;
  }

  // querying

  hasChanged(key) {
    return this._data[key] !== this._previousData[key];
  }

  get(key) {
    return this._data[key];
  }

  has(key) {
    return key in this._data;
  }

  // modifying

  set(key, value) {
    this._data[key] = value;
    this._maybeNotify();
    return this;
  }

  remove(key) {
    delete this._data[key];
    this._maybeNotify();
    return this;
  }

  replace(data) {
    this._data = data;
    this._maybeNotify();
    return this;
  }

  _maybeNotify() {
    if (this._locked == 0) {
      this.emit('change');
      this._previousData = extend(this._data);
    }
  }
}