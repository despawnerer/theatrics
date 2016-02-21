import moment from 'moment';

import Page from '../base/page';
import Event, {eventsToDates} from '../models/event';
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

  getLocation() {
    return this.location.slug;
  }

  mount(element) {
    new Slider(element.querySelector('.item-slider'));
    new Pager(element.querySelector('.pager'));
    this.loadSchedule(element.querySelector('.schedule-page > div'));
  }

  loadSchedule(container) {
    this.app.api
      .fetchEventsInPlace(this.place.get('id'))
      .then(data => data.map(item => new Event(item)))
      .then(events => {
        const dates = eventsToDates(events)
          .filter(date => date.isFuture())
          .map(date => date.momentize(this.location.timezone));
        const view = new ScheduleView({app: this.app, dates: dates});
        clear(container);
        container.appendChild(view.render());
      });
  }
}
