import axios from 'axios';

import Model from '../base/model';
import {buildAPIURL} from '../utils';


export default class Event extends Model {
  fetch() {
    return axios
      .get(
        buildAPIURL(`/events/${this.get('id')}/`),
        {
          params: {
            expand: 'place,images',
          }
        })
      .then(this.onFetched.bind(this));
  }

  onFetched(response) {
    this.replace(response.data);
  }

  isFetched() {
    return this.has('title');
  }
}
