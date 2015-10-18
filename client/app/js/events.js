import moment from 'moment';

import Query from './query';
import Calendar from './calendar';
import Feed from './feed';

import {capfirst} from './utils';


const itemTemplate = (item) => `
<li class="list-item">
  <a href="/event/${item.id}/">
    <div class="list-image-container">
      <img data-src="${item.images[0].thumbnails['640x384']}" class="list-image lazyload"/>
    </div>
    <h2 class="item-header">
      ${capfirst(item.short_title || item.title)}
    </h2>
  </a>
  <div class="tagline">${item.tagline}</div>
  <div class="place">
    ${item.place ? capfirst(item.place.title) : ''}
  </div>
</li>
`;


export default class EventsView {
  constructor() {
    this.element = document.createElement('div');

    this.query = new Query(
      '/events/',
      {
        categories: 'theater',
        fields: 'place,images,tagline,id,age_restriction,title,short_title',
        expand: 'place,images',
        page_size: 24,
      });

    this.calendar = new Calendar();
    this.feed = new Feed(this.query, itemTemplate);
  }

  render() {
    for (let view of [this.calendar, this.feed]) {
      view.render();
      this.element.appendChild(view.element);
    }
  }

  visit(location, date) {
    this.updateQuery(location, date);
    this.calendar.setLocation(location);
    this.calendar.setDate(date);
  }

  updateQuery(location, date) {
    this.query.lock();

    this.query.set('location', location);

    if (date) {
      const day = moment(date);
      this.query.set('actual_since', day.unix());
      this.query.set('actual_until', day.clone().add(1, 'days').unix());
    } else {
      this.query.set('actual_since', moment().unix());
      this.query.remove('actual_until');
    }

    this.query.apply();
  }
}
