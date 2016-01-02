import axios from 'axios';
import moment from 'moment';

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

  getDisplayDates() {
    const allDates = this.data.dates;
    const futureDates = this.getFutureDates();
    return futureDates.length ? futureDates : allDates;
  }

  getFutureDates() {
    const now = moment().unix();
    const allDates = this.data.dates;
    return this.data.dates.filter(d => d.start > now);
  }
}
