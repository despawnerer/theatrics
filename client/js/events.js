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
  constructor(settings, date=null) {
    this.settings = settings;
    this.date = date;

    this.query = new Query(
      '/events/',
      {
        location: settings.get('location'),
        categories: 'theater',
        fields: 'place,images,tagline,id,age_restriction,title,short_title',
        expand: 'place,images',
        page_size: 24,
      });

    this.calendar = new Calendar(this.query);
    this.feed = new Feed(this.query, itemTemplate);

    settings.on('change', this.onSettingsChange.bind(this));
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

  onSettingsChange(key, value) {
    if (key == 'location') {
      this.query.set('location', value);
    }
  }
}
