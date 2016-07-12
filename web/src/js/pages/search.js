import domify from 'domify';

import Page from '../base/page';
import View from '../base/view';
import Event from '../models/event';
import Place from '../models/place';
import Feeder from '../components/feeder';

import template from '../../templates/pages/search.ejs';
import eventTemplate from '../../templates/search-event.ejs';
import placeTemplate from '../../templates/search-place.ejs';


export default class SearchPage extends Page {
  constructor({app, location, query, feed}) {
    super({app});

    this.location = location;
    this.query = query;
    this.feed = feed;
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      query: this.query,
    });
  }

  getTitle() {
    return `Поиск «${this.query}»`;
  }

  mount(element) {
    const feeder = new Feeder(
      element.querySelector('.search-feed'),
      this.feed,
      data => this.buildItemElement(data)
    )
    feeder.loadNewFeed();
  }

  buildItemElement(data) {
    if (data.type == 'place') {
      const place = new Place(data);
      return domify(this.app.renderTemplate(placeTemplate, {place}));
    } else if (data.type == 'event') {
      const event = new Event(data);
      return domify(this.app.renderTemplate(eventTemplate, {event}));
    } else {
      throw new Error(`Unknown item type: ${data.type}`);
    }
  }

  canTransitionFrom(other) {
    return other instanceof SearchPage;
  }
}
