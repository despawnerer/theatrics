import moment from 'moment';

import View from '../base/view';
import Feed from '../models/feed';
import {capfirst} from '../utils';

import Calendar from './calendar';
import FeedView from './feed-view';

import itemTemplate from '../../templates/feed-event.ejs';


export default class EventsView extends View {
  constructor({app, model}) {
    super({app, model});

    this.feed = new Feed(
      '/events/', {
        categories: 'theater',
        fields: 'place,images,tagline,id,age_restriction,title,short_title',
        expand: 'place,images',
        page_size: 24,
      });

    this.calendar = new Calendar({app, model});
    this.feedView = new FeedView({app, itemTemplate, model: this.feed});
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'events-view');
    return element;
  }

  render() {
    this.element.innerHTML = '';

    this.calendar.render();
    this.feedView.render();

    this.element.appendChild(this.calendar.element);
    this.element.appendChild(this.feedView.element);

    this.update();
  }

  unbind() {
    this.calendar.unbind();
    this.feedView.unbind();
    super.unbind();
  }

  onModelChange() {
    this.update();
  }

  update() {
    this.updateFeedQuery();
    this.updateTitle();
    this.updateLocationSetting();
  }

  updateFeedQuery() {
    const query = this.feed.query;

    query.lock();

    query.set('location', this.model.get('location'));

    const date = this.model.get('date');
    if (date) {
      const day = moment(date);
      query.set('actual_since', day.unix());
      query.set('actual_until', day.clone().add(1, 'days').unix());
    } else {
      query.set('actual_since', moment().unix());
      query.remove('actual_until');
    }

    query.apply();
  }

  updateTitle() {
    const state = this.model.data;
    const location = this.app.locations.get(state.location);
    const date = state.date ? moment(state.date).format('D MMMM') : null;
    if (date) {
      this.app.setTitle(`${date} – Спектакли – ${location.name}`);
    } else {
      this.app.setTitle(`Спектакли – ${location.name}`);
    }
  }

  updateLocationSetting() {
    this.app.settings.set('location', this.model.get('location'));
  }
}
