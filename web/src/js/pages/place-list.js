import Page from '../base/page';
import Place from '../models/place';
import Feeder from '../components/feeder';

import FeedPlaceView from '../views/feed-place';

import template from '../../templates/pages/place-list.ejs';


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

  mount(element) {
    const feeder = new Feeder(
      element.querySelector('.feed-container'),
      this.feed,
      data => this.buildItemElement(data)
    );
    feeder.loadNewFeed();
  }

  buildItemElement(data) {
    const event = new Place(data);
    const view = new FeedPlaceView({app: this.app, model: event});
    return view.render();
  }

  canTransitionFrom(other) {
    return other instanceof PlaceListPage;
  }
}

