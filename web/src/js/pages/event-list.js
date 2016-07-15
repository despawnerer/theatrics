import domify from 'domify';

import Page from '../base/page';
import Event from '../models/event';
import Feeder from '../components/feeder';
import Calendar from '../views/calendar';

import template from '../../templates/pages/event-list.ejs';
import eventTemplate from '../../templates/feed-event.ejs';


export default class EventListPage extends Page {
  constructor({app, location, date, feed}) {
    super({app});

    this.location = location;
    this.date = date;
    this.feed = feed;

    this.calendar = new Calendar({app, location, date});
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      calendar: this.calendar,
    });
  }

  getTitle() {
    if (this.date) {
      return `${this.date.format('D MMMM')} – Спектакли – ${this.location.name}`;
    } else {
      return `Спектакли – ${this.location.name}`;
    }
  }

  mount(element, sync=false) {
    this.calendar.mount(element.querySelector('.calendar-container'), sync);

    const feeder = new Feeder(
      element.querySelector('.feed-container'),
      this.feed,
      data => this.buildItemElement(data)
    );
    feeder.loadNewFeed();
  }

  buildItemElement(data) {
    const event = new Event(data);
    return domify(this.app.renderTemplate(eventTemplate, {event}));
  }

  canTransitionFrom(other) {
    return other instanceof EventListPage;
  }
}
