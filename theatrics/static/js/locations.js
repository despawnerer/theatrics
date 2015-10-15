import axios from 'axios';

import {buildAPIURL} from './utils';


export default class Locations {
  constructor() {
    this._map = new Map();
  }

  get(slug) {
    return this._map.get(slug);
  }

  forEach(func) {
    for (let location of this._map.values()){
      func(location);
    }
  }

  fetch() {
    return axios
      .get(
        buildAPIURL('/locations/'),
        {
          params: {
            lang: 'ru',
            fields: 'name,slug,timezone,coords',
            order_by: 'name'
          }
        })
      .then(this.onFetched.bind(this));
  }

  onFetched(response) {
    for (let location of response.data) {
      this._map.set(location.slug, location);
    }
    return this;
  }
}
