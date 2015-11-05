import axios from 'axios';

import {buildAPIURL} from '../utils';


export default class Locations {
  constructor() {
    this._locations = [];
  }

  get(slug) {
    return this._locations.find(x => x.slug == slug);
  }

  forEach(func) {
    this._locations.forEach(func);
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
    this._locations = response.data;
    this._locations.forEach(location => {
      if (location.timezone === 'GMT+03:00') {
        // FIXME: this seems like an issue with moment
        location.timezone = 'Etc/GMT-3';
      }
    });
  }
}
