import moment from 'moment';

import Page from '../base/page';
import Event, {eventsToDates} from '../models/event';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {clear} from '../utils';

import template from '../../templates/place.ejs';
import noScheduleTemplate from '../../templates/parts/no-place-schedule.ejs';


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

  getLocation() {
    return this.location.slug;
  }

  mount(element) {
    this.element = element;

    new Slider(element.querySelector('.item-slider'));
    new Pager(element.querySelector('.pager'));

    this.loadSchedule();
  }

  loadSchedule(container) {
    this.app.api
      .fetchEventsInPlace(this.place.get('id'))
      .then(data => data.map(item => new Event(item)))
      .then(events => this.displaySchedule(events));
  }

  displaySchedule(events) {
    const container = this.element.querySelector('.schedule-page > div');
    const dates = eventsToDates(events).filter(date => date.isActual());

    if (dates.length) {
      const view = new ScheduleView({app: this.app, dates: dates});
      container.innerHTML = view.getHTML();
    } else {
      container.innerHTML = this.app.renderTemplate(noScheduleTemplate, {
        place: this.place
      });
    }
  }
}
