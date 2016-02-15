import equal from 'deep-equal';


export default class Feed {
  constructor(api, path, params) {
    this.api = api;
    this.path = path;
    this.params = params;

    this.nextURL = undefined;
    this.items = [];
  }

  fetchAll() {
    return new Promise((resolve, reject) => {
      const next = () => {
        if (this.hasMore()) {
          this.fetchNext().then(next).catch(reject);
        } else {
          resolve(this.items);
        }
      }
      next();
    });
  }

  fetchNext() {
    return this._fetchNextData()
      .then(data => {
        const items = data.results;
        this.nextURL = data.next;
        this.items = this.items.concat(items);
        return items;
      });
  }

  hasAnything() {
    return this.items.length !== 0;
  }

  hasMore() {
    return this.nextURL !== null;  // undefined means we don't know yet
  }

  _fetchNextData() {
    if (this.nextURL) {
      return this.api.get(this.nextURL);
    } else {
      return this.api.get(this.path, this.params);
    }
  }
}
