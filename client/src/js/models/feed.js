import axios from 'axios';
import {EventEmitter} from 'events';

import Model from '../base/model';
import {buildAPIURL} from '../utils';


export default class Feed extends EventEmitter {
  constructor(path, params) {
    super();

    this.path = path;
    this.query = new Model(params);

    this.nextURL = null;
    this.items = null;
  }

  clear() {
    this.nextURL = null;
    this.items = null;
    this.emit('clear');
  }

  loadMore() {
    const loadingQuery = this.query.clone();
    if (this.nextURL) {
      return axios
        .get(this.nextURL)
        .then(this.onLoaded.bind(this, loadingQuery));
    } else {
      return axios
        .get(
          buildAPIURL(this.path),
          {
            params: this.query.data
          })
        .then(this.onLoaded.bind(this, loadingQuery));
    }
  }

  hasMore() {
    return this.nextURL !== null || this.items === null;
  }

  onLoaded(loadedQuery, response) {
    if (!loadedQuery.equals(this.query)) {
      return;
    }

    if (this.items === null) {
      this.items = [];
    }

    this.nextURL = response.data.next;
    this.items = this.items.concat(response.data.results);

    this.emit('load', response.data.results);
  }
}
