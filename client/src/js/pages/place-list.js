import Page from '../base/page';
import View from '../base/view';
import Place from '../models/place';
import {capfirst} from '../utils';

import FeedView from '../views/feed';
import FeedPlaceView from '../views/feed-place';


export default class PlaceListPage extends Page {
  constructor({app, location, feed}) {
    super({app});

    this.location = app.locations.get(location);
    this.feed = feed;

    this.feedView = new FeedView({
      app,
      feed,
      itemView: FeedPlaceView,
      itemModel: Place,
    });
  }

  getHTML() {
    return `
      <div class="content-container unconstrained">
        ${this.feedView.getHTML()}
      </div>
    `;
  }

  getTitle() {
    return `Театры – ${this.location.name}`
  }

  mount(element) {
    this.feedView.mount(element.querySelector('.feed-container'));
  }

  transitionsInto(other) {
    return other instanceof PlaceListPage;
  }
}

