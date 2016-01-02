import View from '../base/view';
import Feed from '../models/feed';
import {capfirst} from '../utils';

import FeedView from './feed-view';

import itemTemplate from '../../templates/feed-place.ejs';


export default class PlacesView extends View {
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

  render() {
    this.element.innerHTML = '';
    this.feedView.render();
    this.element.appendChild(this.feedView.element);
    this.update();
  }

  onModelChange() {
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
