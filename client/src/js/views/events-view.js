import moment from 'moment';

import View from '../base/view';
import Feed from '../models/feed';
import {capfirst} from '../utils';

import Calendar from './calendar';
import FeedView from './feed-view';


const itemTemplate = ({app, item}) => `
<a href="${app.resolver.reverse('single-event', {id: item.id})}">
  <div class="feed-image-container">
    <img data-src="${item.images[0].thumbnails['640x384']}" class="feed-image lazyload"/>
  </div>
  <h2 class="item-header">
    ${capfirst(item.short_title || item.title)}
  </h2>
</a>
<div class="tagline">${item.tagline}</div>
<div class="place">
  ${item.place ? capfirst(item.place.title) : ''}
</div>
`;


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

    this.updateFeedQuery();

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
    [this.calendar, this.feedView].forEach(view => {
      view.render();
      this.element.appendChild(view.element);
    });

    this.feed.loadMore();
    this.updateTitle();
  }

  unbind() {
    [this.calendar, this.feedView].forEach(view => view.unbind());
    super.unbind();
  }

  onModelChange() {
    this.updateFeedQuery();
    this.updateTitle();
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
}
