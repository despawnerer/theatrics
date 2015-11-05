import View from '../base/view';
import Feed from '../models/feed';
import {capfirst} from '../utils';

import FeedView from './feed-view';


const itemTemplate = ({app, item}) => `
<a href="/place/${item.id}/">
  <div class="list-image-container">
    <img data-src="${item.images[0].thumbnails['640x384']}" class="list-image lazyload"/>
  </div>
  <h2 class="item-header">
    ${capfirst(item.title)}
  </h2>
</a>
<div class="place">${item.address}</div>
`;


export default class PlacesView extends View {
  constructor({app, model}) {
    super({app, model});

    this.feed = new Feed(
      '/places/', {
        categories: 'theatre',
        fields: 'images,title,id,address',
        expand: 'images',
        order_by: '-favorites_count',
        page_size: 24,
      });

    this.updateFeedQuery();

    this.feedView = new FeedView({app, itemTemplate, model: this.feed});
  }

  render() {
    this.element.innerHTML = '';

    this.feedView.render();
    this.element.appendChild(this.feedView.element);

    this.feed.loadMore();
  }

  unbind() {
    this.feedView.unbind();
    super.unbind();
  }

  onModelChange() {
    this.updateFeedQuery();
  }

  updateFeedQuery() {
    this.feed.query.set('location', this.model.get('location'));
  }
}