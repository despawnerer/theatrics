import domify from 'domify';

import Page from '../base/page';
import Place from '../models/place';
import Feeder from '../components/feeder';

import template from '../../templates/pages/place-list.ejs';
import placeTemplate from '../../templates/feed-place.ejs';


export default class PlaceListPage extends Page {
  constructor({app, location, feed}) {
    super({app});

    this.location = location;
    this.feed = feed;
  }

  getHTML() {
    return this.app.renderTemplate(template);
  }

  getTitle() {
    return `Театры – ${this.location.name}`
  }

  mount() {
    const feeder = new Feeder(
      this.element.querySelector('.feed-container'),
      this.feed,
      data => this.buildItemElement(data)
    );
    feeder.loadNewFeed();
  }

  buildItemElement(data) {
    const place = new Place(data);
    return domify(this.app.renderTemplate(placeTemplate, {place}));
  }

  canTransitionFrom(other) {
    return other instanceof PlaceListPage;
  }
}

