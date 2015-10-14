import Query from './query';
import Calendar from './calendar';
import Feed from './feed';

import {capfirst} from './utils';


const itemTemplate = (item) => `
<li class="list-item">
  <div class="list-image-container">
    <a href="/event/${item.id}/">
      <img data-src="${item.images[0].thumbnails['640x384']}" class="list-image lazyload"/>
    </a>
  </div>
  <h2 class="item-header">
    <a href="/event/${item.id}/">
      ${capfirst(item.short_title || item.title)}
    </a>
  </h2>
  <div class="tagline">${item.tagline}</div>
  <div class="place">
    ${item.place ? capfirst(item.place.title) : ''}
  </div>
</li>
`;


export default class EventsView {
  constructor(options, date=null) {
    this.options = options;
    this.date = date;

    this.query = new Query(
      '/events/',
      {
        location: options.get('location'),
        categories: 'theater',
        fields: 'place,images,tagline,id,age_restriction,title,short_title',
        expand: 'place,images',
      });

    this.calendar = new Calendar(this.query);
    this.feed = new Feed(this.query, itemTemplate);

    options.on('change', this.onOptionsChange.bind(this));
  }

  render() {
    this.element = document.createElement('div');

    for (let view of [this.calendar, this.feed]) {
      view.render();
      this.element.appendChild(view.element);
    }

    if (this.date == null) {
      this.calendar.setAnyDay();
    } else {
      this.calendar.setDay(this.date);
    }
  }

  onOptionsChange(key, value) {
    if (key == 'location') {
      this.query.set('location', value);
    }
  }
}
