import View from '../base/view';
import Feed from '../models/feed';
import {capfirst} from '../utils';

import FeedView from '../views/feed-view';

import itemTemplate from '../../templates/feed-place.ejs';


export default class PlaceListPageView extends View {
  constructor({app, model}) {
    super({app, model});

    this.feed = new Feed(
      '/places/', {
        fields: 'images,title,id,address',
        categories: 'theatre,-cafe',
        expand: 'images',
        order_by: '-favorites_count',
        page_size: 24,
      });

    this.feedView = new FeedView({app, itemTemplate, model: this.feed});
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'content-container unconstrained');
    return element;
  }

  mount(element) {
    element.appendChild(this.feedView.render());
    this.model.on('change', () => this.update())
    this.update();
  }

  update() {
    this.updateFeedQuery();
    this.updateAppState();
  }

  updateFeedQuery() {
    this.feed.query.set('location', this.model.get('location'));
  }

  updateAppState() {
    const location = this.app.locations.get(this.model.get('location'));
    this.app.setTitle(`Театры – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }
}
