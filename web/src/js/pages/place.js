import moment from 'moment';

import Page from '../base/page';
import Event, {eventsToDates} from '../models/event';
import Breadcrumbs from '../models/breadcrumbs';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {clear} from '../utils';

import template from '../../templates/pages/place.ejs';
import noScheduleTemplate from '../../templates/parts/no-place-schedule.ejs';


export default class PlacePage extends Page {
  constructor({app, place}) {
    super({app});

    this.place = place;
    this.location = place.getLocation();

    this.breadcrumbs = new Breadcrumbs([
      {
        url: app.url('location', {location: this.location.slug}),
        title: this.location.name,
      },
      {
        url: app.url('place-list', {location: this.location.slug}),
        title: "Театры",
      }
    ]);
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      location: this.location,
      place: this.place,
      breadcrumbs: this.breadcrumbs,
    });
  }

  getTitle() {
    return `${this.place.getName()} – ${this.location.name}`;
  }

  mount() {
    const sliderElement = this.element.querySelector('.item-slider');
    if (sliderElement) {
      new Slider(this.element.querySelector('.item-slider'));
    }

    new Pager(this.element.querySelector('.pager'));

    this.loadSchedule();
  }

  loadSchedule(container) {
    this.app.api
      .fetchEventsInPlace(this.place.data.id)
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
