import moment from 'moment';

import {makeAbsoluteURL} from '../utils/urls';


export default class Date {
  constructor(event, spec) {
    this.event = event;
    this.timezone = event.getLocation().timezone;

    this.start = moment.tz(spec.start, this.timezone);
    this.end = moment.tz(spec.end, this.timezone);

    this.isDateBased = spec.start.length == 10;  // 10 characters is ISO date

    this.startBound = this.start;
    this.endBound = this.isDateBased ? this.end.clone().add(1, 'day') : this.end;
  }

  intersectsAny(others) {
    return others.some(other => this.intersects(other));
  }

  intersects(other) {
    return (
      this.endBound.isAfter(other.startBound) &&
      this.startBound.isBefore(other.endBound)
    );
  }

  getDateRange() {
    return {
      start: this.start.clone().startOf('day'),
      end: this.end.clone().startOf('day')
    }
  }

  getDuration() {
    return moment.duration((this.end.unix() - this.start.unix()) * 1000);
  }

  hasKnownEnd() {
    return !this.start.isSame(this.end);
  }

  isActual() {
    return this.endBound.isAfter(moment());
  }

  toJSONLD(app) {
    const url = app.url('event', {id: this.event.data.id});
    const result = {
      '@context': 'http://schema.org',
      '@type': this.event.getSchemaOrgType(),
      '@id': `${url}#${this.start.unix()}`,
      name: this.event.getName(),
      url: makeAbsoluteURL(url),
    }

    const place = this.event.getPlace();
    if (place) {
      result.location = place.toJSONLD(app);
    }

    const price = this.event.getPrice();
    if (price && price.hasRange()) {
      result.offers = price.toJSONLD(app);
    }

    const duration = this.getDuration();
    if (duration.asMinutes() > 0) {
      result.duration = duration.toString();
    }

    if (this.isDateBased) {
      result.startDate = this.start.format('YYYY-MM-DD');
      result.endDate = this.end.format('YYYY-MM-DD');
    } else {
      result.startDate = this.start.format();
      if (this.hasKnownEnd()) result.endDate = this.end.format();
    }

    return result;
  }
}
