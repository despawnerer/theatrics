import moment from 'moment';

import Page from '../base/page';
import Event, {eventsToDates} from '../models/event';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {clear} from '../utils';

import template from '../../templates/event.ejs';
import noScheduleTemplate from '../../templates/parts/no-festival-schedule.ejs';


export default class EventPage extends Page {
  constructor({app, event}) {
    super({app});

    this.event = event;
    this.location = event.getLocation();
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      location: this.location,
      event: this.event,
    });
  }

  getTitle() {
    return `${this.event.getFullName()} – ${this.location.name}`;
  }

  mount(element) {
    this.element = element;

    new Slider(element.querySelector('.item-slider'));

    if (this.event.isFestival() && this.event.hasChildren()) {
      new Pager(element.querySelector('.pager'));
      this.loadSchedule();
    }
  }

  loadSchedule() {
    this.app.api
      .fetchEventChildren(this.event.data.id)
      .then(data => data.map(item => new Event(item)))
      .then(events => this.displaySchedule(events));
  }

  displaySchedule(events) {
    const container = this.element.querySelector('.schedule-page > div');
    const parentDates = this.event.getDates();
    const dates = eventsToDates(events)
      .filter(date => date.intersectsAny(parentDates))

    if (dates.length) {
      const view = new ScheduleView({app: this.app, dates: dates});
      container.innerHTML = view.getHTML();
    } else {
      container.innerHTML = this.app.renderTemplate(noScheduleTemplate);
    }
  }
}
