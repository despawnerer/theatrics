import axios from 'axios';

import {buildAPIURL} from '../utils';


export default class Locations {
  constructor() {
    this._locations = [];
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
  }
}
