import moment from 'moment';

import Page from '../base/page';
import Event from '../models/event';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {clear} from '../utils';

import template from '../../templates/place.ejs';


export default class PlacePage extends Page {
  constructor({app, place}) {
    super({app});

    this.place = place;
    this.location = app.locations.get(place.data.location);
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      location: this.location,
      place: this.place,
    });
  }

  getTitle() {
    return `${this.place.getTitle()} – ${this.location.name}`;
  }

  mount(element) {
    new Slider(element.querySelector('.item-slider'));
    new Pager(element.querySelector('.pager'));
    this.loadSchedule(element.querySelector('.schedule-page > div'));
  }

  loadSchedule(container) {
    this.app.api
      .fetchEventsInPlace(this.place.get('id'))
      .then(data => {
        const dates = data
          .map(itemData => new Event(itemData))
          .map(event => event.getFutureDates())
          .reduce((a, b) => a.concat(b), [])
          .sort((date1, date2) => date1.start - date2.start)
          .map(date => this.momentizeDate(date));
        const view = new ScheduleView({app: this.app, dates: dates});
        clear(container);
        container.appendChild(view.render());
      });
  }

  momentizeDate(date) {
    return {
      start: moment.unix(date.start).tz(this.location.timezone),
      end: date.end ? moment.unix(date.end).tz(this.location.timezone) : null,
      event: date.event,
    }
  }
}
