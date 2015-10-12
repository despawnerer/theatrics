import extend from 'extend';

import {EventEmitter} from 'events';


export default class Query extends EventEmitter {
	constructor(query) {
    super();
		this._query = query;
    this._locked = 0;
	}

  get() {
    return this._query;
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

  // updating

  replace(query) {
    this._query = query;
    this._maybeNotify();
    return this;
  }

  update(query) {
    extend(this._query, query);
    this._maybeNotify();
    return this;
  }

  remove(...fieldList) {
    for (let field of fieldList) {
      delete this._query[field];
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