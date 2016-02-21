import moment from 'moment';

import Page from '../base/page';
import Event, {eventsToDates} from '../models/event';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {clear} from '../utils';

import template from '../../templates/event.ejs';


export default class EventPage extends Page {
  constructor({app, event}) {
    super({app});

    this.event = event;
    this.location = app.locations.get(event.data.location.slug);
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      location: this.location,
      event: this.event,
    });
  }

  getTitle() {
    return `${this.event.getLongTitle()} – ${this.location.name}`;
  }

  getLocation() {
    return this.location.slug;
  }

  mount(element) {
    new Slider(element.querySelector('.item-slider'));

    if (this.event.isFestival()) {
      new Pager(element.querySelector('.pager'));
      this.loadSchedule(element.querySelector('.schedule-page > div'));
    }
  }

  loadSchedule(container) {
    const parentDates = this.event.getDates();
    this.app.api
      .fetchEventChildren(this.event.get('id'))
      .then(data => data.map(item => new Event(item)))
      .then(events => {
        const dates = eventsToDates(events)
          .filter(date => date.intersectsAny(parentDates))
          .map(date => date.momentize(this.location.timezone));
        const view = new ScheduleView({app: this.app, dates: dates});
        clear(container);
        container.appendChild(view.render());
      });
  }
}
