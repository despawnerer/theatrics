import View from '../base/view';
import Place from '../models/place';
import {capfirst} from '../utils';

import FeedView from '../views/feed';

import itemTemplate from '../../templates/feed-place.ejs';


export default class PlaceListPageView extends View {
  constructor({app, model}) {
    super({app, model});

    this.feedView = new FeedView({
      app,
      itemView: FeedPlaceView,
      itemModel: Place,
      feed: this.getFeed(),
    });
  }

  getHTML() {
    return `
      <div class="content-container unconstrained">
        ${this.feedView.getHTML()}
      </div>
    `;
  }

  mount(element) {
    this.feedView.mount(element.querySelector('.feed-container'));

    this.updateAppState();

    this.model.on('change', () => {
      const feed = this.getFeed();
      this.feedView.setFeed(feed);
      this.updateAppState();
    });
  }

  getFeed() {
    const location = this.model.get('location');
    return this.app.api.getPlacesFeed(location);
  }

  updateAppState() {
    const location = this.app.locations.get(this.model.get('location'));
    this.app.setTitle(`Театры – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }
}


class FeedPlaceView extends View {
  getHTML() {
    return itemTemplate({
      capfirst,
      app: this.app,
      place: this.model,
    });
  }
}
