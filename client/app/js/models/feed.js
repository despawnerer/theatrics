import axios from 'axios';
import {EventEmitter} from 'events';

import Model from '../base/model';
import {buildAPIURL} from '../utils';


export default class Feed extends EventEmitter {
  constructor(path, params) {
    super();

    this.path = path;
    this.query = new Model(params);

    this.onQueryChange = this.onQueryChange.bind(this);
    this.onLoaded = this.onLoaded.bind(this);

    this.query.on('change', this.onQueryChange);

    this.nextURL = null;
    this.items = null;
  }

  onQueryChange() {
    this.emit('query-change');
  }

  clear() {
    this.nextURL = null;
    this.items = null;
    this.emit('clear');
  }

  loadMore() {
    if (this.nextURL) {
      return axios
        .get(this.nextURL)
        .then(this.onLoaded);
    } else {
      return axios
        .get(
          buildAPIURL(this.path),
          {
            params: this.query.data
          })
        .then(this.onLoaded);
    }
  }

  hasMore() {
    return this.nextURL !== null || this.items === null;
  }

  onLoaded(response) {
    if (this.items === null) {
      this.items = [];
    }

    this.nextURL = response.data.next;
    this.items.concat(response.data.results);

    this.emit('load', response.data.results);
  }
}
