import moment from 'moment';

import Page from '../base/page';
import View from '../base/view';
import Event from '../models/event';

import Calendar from '../views/calendar';
import FeedView from '../views/feed';
import FeedEventView from '../views/feed-event';


export default class EventListPage extends Page {
  constructor({app, location, date, feed}) {
    super({app});

    this.location = app.locations.get(location);
    this.date = date ? moment(date).tz(this.location.timezone) : null;
    this.feed = feed;

    this.calendar = new Calendar({app, location, date});
    this.feedView = new FeedView({
      app,
      feed,
      itemView: FeedEventView,
      itemModel: Event,
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

  getTitle() {
    if (this.date) {
      return `${this.date.format('D MMMM')} – Спектакли – ${this.location.name}`;
    } else {
      return `Спектакли – ${this.location.name}`;
    }
  }

  mount(element, sync=false) {
    this.calendar.mount(element.querySelector('.calendar-container'), sync);
    this.feedView.mount(element.querySelector('.feed-container'));
  }

  canTransitionFrom(other) {
    return other instanceof EventListPage;
  }
}
