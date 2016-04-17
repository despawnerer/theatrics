import moment from 'moment';

import locations from '../core/locations';
import Model from '../base/model';
import {capfirst, range, makeAbsoluteURL} from '../utils';

import Place from './place';


export default class Event extends Model {
  getName() {
    return this.data.name || this.getFullName();
  }

  getFullName() {
    return capfirst(this.data.full_name);
  }

  getParent() {
    if (this.data.parent) {
      return new Event(this.data.parent);
    } else {
      return undefined;
    }
  }

  getPlace() {
    if (this.data.place) {
      return new Place(this.data.place);
    } else {
      return undefined;
    }
  }

  getLocation() {
    return locations.get(this.data.location);
  }

  getDisplayDates() {
    const allDates = this.getDates();
    const actualDates = allDates.filter(date => date.isActual())
    return actualDates.length ? actualDates : allDates;
  }

  getDates() {
    return this.data.dates.map(spec => new Date(this, spec));
  }

  hasChildren() {
    return this.data.children_count > 0;
  }

  isPremiere() {
    return this.data.is_premiere;
  }

  isFestival() {
    return this.data.kind == 'festival';
  }

  isExhibition() {
    return this.data.kind == 'exhibition';
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

    this.start = moment(spec.start);
    this.end = moment(spec.end);

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
    return this.end.isAfter(moment());
  }

  toJSONLD(app) {
    const url = app.resolver.reverse('event', {id: this.event.data.id});
    const result = {
      '@context': 'http://schema.org',
      '@type': this.event.getItemType(),
      '@id': `${url}#${this.start.unix()}`,
      name: this.event.getName(),
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
    .sort((date1, date2) => date1.start.unix() - date2.start.unix());
}
