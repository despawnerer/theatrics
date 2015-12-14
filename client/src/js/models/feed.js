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

  fetchAll() {
    const loadingQuery = this.query.clone();
    let items = null;
    let nextURL = null;

    const hasMore = () => nextURL !== null || items == null;
    const fetchNextPage = () => {
      if (!hasMore()) {
        this._handleLoaded(loadingQuery, items, nextURL);
        return;
      }

      this._doFetchMore(loadingQuery, nextURL).then(response => {
        if (!loadingQuery.equals(this.query)) {
          return;
        }
        items = (items || []).concat(response.data.results);
        nextURL = response.data.next;
        fetchNextPage();
      });
    }

    fetchNextPage();
  }

  fetchMore() {
    const loadingQuery = this.query.clone();
    this._doFetchMore(this.query, this.nextURL).then(response => {
      const newItems = response.data.results;
      const items = (this.items || []).concat(newItems);
      const nextURL = response.data.next;
      this._handleLoaded(loadingQuery, newItems, nextURL);
    });
  }

  hasMore() {
    return this.nextURL !== null || this.items === null;
  }

  _doFetchMore(query, nextURL) {
    if (nextURL) {
      return axios.get(nextURL);
    } else {
      return axios.get(
        buildAPIURL(this.path),
        {params: query.data}
      );
    }
  }

  _handleLoaded(loadedQuery, items, nextURL) {
    if (loadedQuery.equals(this.query)) {
      this.items = items;
      this.nextURL = nextURL;
      this.emit('load', items);
    }
  }
}
