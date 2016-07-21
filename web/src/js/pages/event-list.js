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

  mount() {
    this.calendar.attach(this.element.querySelector('.calendar-container'));

    const feeder = new Feeder(
      this.element.querySelector('.feed-container'),
      this.feed,
      data => this.buildItemElement(data)
    );
    feeder.loadNewFeed();
  }

  sync() {
    this.calendar.sync();
  }

  buildItemElement(data) {
    const event = new Event(data);
    return domify(this.app.renderTemplate(eventTemplate, {event}));
  }

  canTransitionFrom(other) {
    return other instanceof EventListPage;
  }
}
