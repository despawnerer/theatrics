import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import {capfirst} from '../utils';

import Calendar from '../views/calendar';
import FeedView from '../views/feed';

import itemTemplate from '../../templates/feed-event.ejs';


export default class EventListPageView extends View {
  constructor({app, model}) {
    super({app, model});

    this.calendar = new Calendar({app, model});
    this.feedView = new FeedView({
      app,
      itemView: FeedEventView,
      itemModel: Event,
      feed: this.getFeed(),
    });
  }

  getHTML() {
    return `
      <div class="events-view content-container unconstrained">
        ${this.calendar.getHTML()}
        ${this.feedView.getHTML()}
      </div>
    `
  }

  mount(element) {
    this.calendar.mount(element.querySelector('.calendar-container'));
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
    const date = this.model.get('date');
    return this.app.api.getEventsFeed(location, date);
  }

  updateAppState() {
    const state = this.model.data;
    const location = this.app.locations.get(state.location);
    const date = state.date ? moment(state.date).format('D MMMM') : null;
    if (date) {
      this.app.setTitle(`${date} – Спектакли – ${location.name}`);
    } else {
      this.app.setTitle(`Спектакли – ${location.name}`);
    }
    this.app.settings.set('location', this.model.get('location'));
  }
}


class FeedEventView extends View {
  getHTML() {
    return itemTemplate({
      capfirst,
      app: this.app,
      event: this.model,
    });
  }
}
