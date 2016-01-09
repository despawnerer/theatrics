import axios from 'axios';
import moment from 'moment';

import Model from '../base/model';
import {buildAPIURL, capfirst} from '../utils';

import Place from './place';


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

  isFestival() {
    return this.data.categories.indexOf('festival') !== -1;
  }

  getShortTitle() {
    return this.data.short_title || this.getLongTitle();
  }

  getLongTitle() {
    return capfirst(this.data.title);
  }

  getPlace() {
    if (this.data.place) {
      return new Place(this.data.place);
    } else {
      return undefined;
    }
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
