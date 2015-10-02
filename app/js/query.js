import Emitter from 'tiny-emitter';
import extend from 'extend';


export default class Query {
	constructor(query) {
		this._query = query;
		this._emitter = new Emitter();
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

  remove(fieldList) {
    for (let field of fieldList) {
      delete fieldList[field];
    }
    this._maybeNotify();
    return this;
  }

  _maybeNotify() {
    if (this._locked == 0) {
      this._emitter.emit('update');
    }
  }

  // events

	on(event, listener) {
		this._emitter.on(event, listener);
	}

	off(event, listener) {
		this._emitter.off(event, listener);
	}
}