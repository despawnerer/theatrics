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
    return this.data.dates.map(date => new Date(this, date.start, date.end));
  }
}


export class Date {
  constructor(event, start, end) {
    this.event = event;
    this.start = start;
    this.end = end || start;
  }

  intersectsAny(others) {
    return others.some(other => this.intersects(other));
  }

  intersects(other) {
    return this.end >= other.start && this.start < other.end;
  }

  isFuture() {
    return this.start > moment().unix();
  }

  momentize(timezone) {
    return {
      event: this.event,
      start: moment.unix(this.start).tz(timezone),
      end: moment.unix(this.end).tz(timezone)
    }
  }
}


export function eventsToDates(events) {
  return events
    .map(event => event.getDates())
    .reduce((a, b) => a.concat(b), [])
    .sort((date1, date2) => date1.start - date2.start);
}
