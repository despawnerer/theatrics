import Query from './query';
import Feed from './feed';

import {capfirst} from './utils';


const itemTemplate = (item) => `
<li class="list-item">
  <a href="/place/${item.id}/">
    <div class="list-image-container">
      <img data-src="${item.images[0].thumbnails['640x384']}" class="list-image lazyload"/>
    </div>
    <h2 class="item-header">
      ${capfirst(item.title)}
    </h2>
  </a>
  <div class="place">${item.address}</div>
</li>
`;


export default class PlacesView {
  constructor() {
    this.element = document.createElement('div');

    this.query = new Query(
      '/places/',
      {
        categories: 'theatre',
        fields: 'images,title,id,address',
        expand: 'images',
        order_by: '-favorites_count',
        page_size: 24,
      });

    this.feed = new Feed(this.query, itemTemplate);
  }

  render() {
    this.feed.render();
    this.element.appendChild(this.feed.element);
  }

  visit(location) {
    this.query.set('location', location);
  }
}
