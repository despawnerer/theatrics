import Emitter from 'tiny-emitter';
import extend from 'extend';


export default class Query {
	constructor(query) {
		this._query = query;
		this._emitter = new Emitter();
    this._blocked = false;
	}

  get() {
    return this._query;
  }

  begin() {
    this._blocked = true;
    return this;
  }

  commit() {
    this._blocked = false;
    this._emitUpdate()
    return this;
  }

  // updating

  replace(query) {
    this._query = query;
    this._emitUpdate();
    return this;
  }

  update(query) {
    extend(this._query, query);
    this._emitUpdate();
    return this;
  }

  remove(fieldList) {
    for (field of fieldList) {
      delete fieldList[field];
    }
    this._emitUpdate();
    return this;
  }

  _emitUpdate() {
    if (!this._blocked) {
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