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
    return this.data.dates.map(date => new Date(this, date));
  }
}


export class Date {
  constructor(event, date) {
    this.event = event;

    this.isDateBased = date.start_time === null;
    this.startTs = date.start;
    this.endTs = date.end;

    const startDateTs = date.start_date;
    const endDateTs = date.end_date || date.start_date;
    if (this.isDateBased) {
      this.start = moment.unix(startDateTs).utc();
      this.end = moment.unix(endDateTs).utc();
    } else {
      this.start = moment.unix(startDateTs + date.start_time).utc();
      this.end = moment.unix(endDateTs + (date.end_time || date.start_time)).utc();
    }
  }

  intersectsAny(others) {
    return others.some(other => this.intersects(other));
  }

  intersects(other) {
    return this.endTs >= other.startTs && this.startTs < other.endTs;
  }

  getDuration() {
    return moment.duration((this.endTs - this.startTs) * 1000);
  }

  isFuture() {
    return this.startTs > moment().unix();
  }
}


export function eventsToDates(events) {
  return events
    .map(event => event.getDates())
    .reduce((a, b) => a.concat(b), [])
    .sort((date1, date2) => date1.startTs - date2.startTs);
}
