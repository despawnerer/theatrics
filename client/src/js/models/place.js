import axios from 'axios';

import Model from '../base/model';
import {buildAPIURL, capfirst} from '../utils';


export default class Place extends Model {
  fetch() {
    return axios
      .get(
        buildAPIURL(`/places/${this.get('id')}/`),
        {
          params: {
            expand: 'images,location',
          }
        })
      .then(this.onFetched.bind(this));
  }

  onFetched(response) {
    this.replace(response.data);
  }

  getTitle() {
    return capfirst(this.data.title);
  }

  getPresentFields(...fields) {
    return fields.filter(f => Boolean(this.data[f]))
  }
}
