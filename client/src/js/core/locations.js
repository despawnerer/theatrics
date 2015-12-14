import axios from 'axios';

import {buildAPIURL} from '../utils';

import locations from '../../data/locations.json';


export default class Locations {
  constructor() {
    this._locations = locations;
  }

  get(slug) {
    return this._locations.find(x => x.slug == slug);
  }

  forEach(func) {
    this._locations.forEach(func);
  }
}
