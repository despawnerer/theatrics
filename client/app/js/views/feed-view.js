import axios from 'axios';

import View from '../base/view';
import Feed from '../models/feed';
import {buildAPIURL, toggle, show, hide} from '../utils';


const template = () => `
<ol class="list" hidden></ol>
<div class="load-more-container" hidden>
  <button class="load-more-button" hidden>Загрузить ещё</button>
</div>
`;


export default class FeedView extends View {
  constructor({app, model, itemTemplate}) {
    super({app, model});

    this.itemTemplate = itemTemplate;

    this.onQueryChange = this.onQueryChange.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onLoaded = this.onLoaded.bind(this);

    this.events.bind('click .load-more-button', 'onLoadMoreClicked');
    this.model.on('query-change', this.onQueryChange);
    this.model.on('clear', this.onClear);
    this.model.on('load', this.onLoaded);
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'feed-container');
    return element;
  }

  render() {
    this.element.innerHTML = template();
    this.listContainer = this.element.querySelector('.list');
    this.loadMoreContainer = this.element.querySelector('.load-more-container');
  }

  onQueryChange() {
    this.model.clear();
    this.model.loadMore();
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.model.loadMore();
  }

  onClear() {
    this.listContainer.innerHTML = '';
    hide(this.listContainer);
    hide(this.loadMoreContainer);
  }

  onLoaded(items) {
    items.forEach(item => {
      const element = this.buildItemElement(item);
      this.listContainer.appendChild(element);
    });
    show(this.listContainer);
    toggle(this.loadMoreContainer, this.model.hasMore());
  }

  buildItemElement(item) {
    const element = document.createElement('li');
    element.setAttribute('class', 'list-item');
    element.innerHTML = this.itemTemplate({
      item,
      app: this.app
    });
    return element;
  }
}
