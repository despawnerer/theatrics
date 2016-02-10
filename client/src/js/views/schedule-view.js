import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import {capfirst, groupArray, bigLoader} from '../utils';

import template from '../../templates/schedule.ejs';


export default class ScheduleView extends View {
  getHTML() {
    return `<div class="schedule">${bigLoader()}</div>`;
  }

  mount(element) {
    this.element = element;
    this.model.on('load', () => this.renderItems());
    this.model.fetchAll();
  }

  renderItems() {
    const events = this.model.items.map(item => new Event(item));
    const dates = this.eventsToDates(events);
    const dayGroups = groupArray(
      dates, 'day',
      date => date.start.clone().startOf('day'),
      (day1, day2) => day1.isSame(day2)
    )
    this.element.innerHTML = template({
      capfirst,
      app: this.app,
      dayGroups: dayGroups,
    });
  }

  eventsToDates(events) {
    return events
      .map(e => e.getFutureDates())
      .reduce((a, b) => a.concat(b), [])
      .sort((date1, date2) => date1.start - date2.start)
      .map(this.momentizeDate.bind(this));
  }

  momentizeDate(date) {
    const location = this.app.locations.get(date.event.data.location.slug);
    return {
      start: moment.unix(date.start).tz(location.timezone),
      end: date.end ? moment.unix(date.end).tz(location.timezone) : null,
      event: date.event,
    }
  }
}
