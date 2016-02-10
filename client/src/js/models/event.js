import moment from 'moment';

import Model from '../base/model';
import {capfirst} from '../utils';

import Place from './place';


export default class Event extends Model {
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
    const futureDates = this.getFutureDates();
    return futureDates.length ? futureDates : this.getDates();
  }

  getFutureDates() {
    const now = moment().unix();
    return this.getDates().filter(date => date.start > now);
  }

  getDates() {
    return this.data.dates.map(date => {
      return {
        start: date.start,
        end: date.end,
        event: this,
      }
    });
  }
}
