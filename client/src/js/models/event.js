import moment from 'moment';

import Model from '../base/model';
import {capfirst, range, makeAbsoluteURL} from '../utils';

import Place from './place';


export default class Event extends Model {
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
    const allDates = this.getDates();
    const actualDates = allDates.filter(date => date.isActual())
    return actualDates.length ? actualDates : allDates;
  }

  getDates() {
    if (!this.isFestival() && !this.isExhibition()) {
      return this.data.dates
        .map(spec => splitDateSpec(spec))
        .reduce((a, b) => a.concat(b), [])
        .map(spec => new Date(this, spec));
    } else {
      return this.data.dates.map(spec => new Date(this, spec));
    }
  }

  isPremiere() {
    return this.data.tags && this.data.tags.indexOf('премьера') !== -1;
  }

  isFestival() {
    return this.data.categories.indexOf('festival') !== -1;
  }

  isExhibition() {
    return this.data.categories.indexOf('exhibition') !== -1;
  }

  getItemType() {
    if (this.isFestival()) {
      return 'Festival';
    } else if (this.isExhibition()) {
      return 'ExhibitionEvent';
    } else {
      return 'TheaterEvent';
    }
  }
}


export class Date {
  constructor(event, spec) {
    this.event = event;

    this.isDateBased = spec.start_time === null;
    this.startTs = spec.start;
    this.endTs = spec.end;

    const startDateTs = spec.start_date;
    const endDateTs = spec.end_date || spec.start_date;
    if (this.isDateBased) {
      this.start = moment.unix(startDateTs).utc();
      this.end = moment.unix(endDateTs).utc();
    } else {
      this.start = moment.unix(startDateTs + spec.start_time).utc();
      this.end = moment.unix(endDateTs + (spec.end_time || spec.start_time)).utc();
    }
  }

  intersectsAny(others) {
    return others.some(other => this.intersects(other));
  }

  intersects(other) {
    return this.endTs >= other.startTs && this.startTs < other.endTs;
  }

  getDateRange() {
    return {
      start: this.start.clone().startOf('day'),
      end: this.end.clone().startOf('day')
    }
  }

  getDuration() {
    return moment.duration((this.endTs - this.startTs) * 1000);
  }

  hasKnownEnd() {
    return this.endTs != this.startTs;
  }

  isActual() {
    return this.endTs > moment().unix();
  }

  toJSONLD(app) {
    const url = app.resolver.reverse('event', {id: this.event.data.id});
    const result = {
      '@context': 'http://schema.org',
      '@type': this.event.getItemType(),
      '@id': `${url}#${this.startTs}`,
      name: this.event.getShortTitle(),
      url: makeAbsoluteURL(url),
    }

    const place = this.event.getPlace();
    if (place) {
      result.location = place.toJSONLD(app);
    }

    if (this.isDateBased) {
      result.startDate = this.start.format('YYYY-MM-DD');
      result.endDate = this.end.format('YYYY-MM-DD');
    } else {
      result.startDate = this.start.format('YYYY-MM-DD[T]HH:mm');
      if (this.hasKnownEnd()) result.endDate = this.end.format('YYYY-MM-DD[T]HH:mm');
    }

    return result;
  }
}


export function eventsToDates(events) {
  return events
    .map(event => event.getDates())
    .reduce((a, b) => a.concat(b), [])
    .sort((date1, date2) => date1.startTs - date2.startTs);
}


function splitDateSpec(spec) {
  if (spec.is_continuous ||
      (!spec.start_time && !spec.schedules.length) ||
      !spec.end_date ||
      spec.start_date == spec.end_date) {
    return [spec];
  }

  const start = moment.unix(spec.start_date).utc();
  const end = moment.unix(spec.end_date).utc();
  const days = end.diff(start, 'days');
  const schedules =
    spec.schedules.length
    ? spec.schedules
    : [{
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      start_time: spec.start_time,
      end_time: spec.end_time,
    }];

  const specs = [];
  range(days).forEach(n => {
    const startDate = start.clone().add(n, 'days');
    const dayOfWeek = startDate.isoWeekday();
    const schedule = schedules.find(s => s.days_of_week.indexOf(dayOfWeek) >= 0);
    if (schedule) {
      specs.push({
        start_date: startDate.unix(),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        start: startDate.unix() + schedule.start_time,
        end: startDate.unix() + schedule.end_time, // FIXME: handle end_time lower than start_time
      });
    };
  });

  return specs;
}
