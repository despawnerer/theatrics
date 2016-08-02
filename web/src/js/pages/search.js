import domify from 'domify';

import Page from '../base/page';
import View from '../base/view';
import Event from '../models/event';
import Place from '../models/place';
import Feeder from '../components/feeder';

import {show, hide, toggle, isVisible} from '../utils/elements';

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
    if (this.hasRealQuery()) {
      return `Поиск «${this.query}» – ${this.location.name}`;
    } else {
      return `Поиск без запроса – ${this.location.name}`;
    }
  }

  mount() {
    const resultList = this.element.querySelector('.search-results');
    const noResultsMessage = this.element.querySelector('.no-results');
    const noQueryMessage = this.element.querySelector('.no-query');
    const loader = this.element.querySelector('.big-loader-container');
    if (this.hasRealQuery()) {
      const feeder = new Feeder(
        this.element.querySelector('.search-feed'),
        this.feed,
        data => this.buildItemElement(data)
      )
      feeder.loadNewFeed();
      hide(noQueryMessage);
      toggle(loader, !isVisible(resultList));
    } else {
      hide(noResultsMessage);
      hide(resultList);
      hide(loader);
      show(noQueryMessage);
    }
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

  hasRealQuery() {
    return this.query && this.query.length > 1;
  }

  canTransitionFrom(other) {
    return other instanceof SearchPage;
  }
}
