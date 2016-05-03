import {EventEmitter} from 'events';

import equal from 'deep-equal';


export default class Cache extends EventEmitter {
  constructor(size) {
    super();
    this.size = size;
    this.cache = [];
  }

  put(key, value) {
    const existing = this.cache.findIndex(item => equal(item.key, key));
    if (existing >= 0) {
      this.cache.splice(existing, 1);
    }

    this.cache.push({key, value});

    if (this.cache.length > this.size) {
      const removeCount = this.cache.length - this.size;
      const removed = this.cache.splice(0, removeCount);
      removed.forEach(item => this.emit('remove', item.key, item.value));
    }
  }

  get(key) {
    const item = this.cache.find(item => equal(item.key, key));
    return item ? item.value : null;
  }
}
