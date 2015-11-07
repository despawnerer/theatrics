import axios from 'axios';

import View from '../base/view';
import Feed from '../models/feed';
import Loader from '../components/loader';
import {buildAPIURL, toggle, show, hide} from '../utils';


const template = () => `
<ol class="feed" hidden></ol>
<div class="load-more-container" hidden>
  <button class="load-more-button" hidden>Загрузить ещё</button>
</div>
<div class="nothing-at-all" hidden>Ничего нет</div>
<div class="big-loader-container" hidden></div>
`;


export default class FeedView extends View {
  constructor({app, model, itemTemplate}) {
    super({app, model});

    this.itemTemplate = itemTemplate;

    this.onQueryChange = this.onQueryChange.bind(this);
    this.onLoaded = this.onLoaded.bind(this);

    this.events.bind('click .load-more-button', 'onLoadMoreClicked');
    this.model.on('query-change', this.onQueryChange);
    this.model.on('load', this.onLoaded);

    this.needsClearing = false;

    this.feedLoader = new Loader({progress: 0.25});
    this.moreLoader = new Loader({progress: 0.25});
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'feed-container');
    return element;
  }

  render() {
    this.element.innerHTML = template();

    this.listContainer = this.element.querySelector('.feed');
    this.loadMoreContainer = this.element.querySelector('.load-more-container');
    this.feedLoaderContainer = this.element.querySelector('.big-loader-container');
    this.nothingAtAll = this.element.querySelector('.nothing-at-all');

    this.feedLoaderContainer.appendChild(this.feedLoader.element);
    this.loadMoreContainer.appendChild(this.moreLoader.element);

    show(this.feedLoaderContainer);
  }

  onQueryChange() {
    this.needsClearing = true;
    this.model.clear();
    this.model.loadMore();
    show(this.feedLoaderContainer);
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.model.loadMore();
    this.loadMoreContainer.classList.add('loading');
  }

  onLoaded(items) {
    const hasMore = this.model.hasMore();
    const hasAnything = this.model.items.length !== 0;

    if (this.needsClearing) {
      this.needsClearing = false;
      this.listContainer.innerHTML = '';
    }

    items.forEach(item => {
      const element = this.buildItemElement(item);
      this.listContainer.appendChild(element);
    });

    hide(this.feedLoaderContainer);
    show(this.listContainer);
    toggle(this.loadMoreContainer, hasMore);
    toggle(this.nothingAtAll, !hasAnything);

    this.loadMoreContainer.classList.remove('loading');
  }

  buildItemElement(item) {
    const element = document.createElement('li');
    element.setAttribute('class', 'feed-item');
    element.innerHTML = this.itemTemplate({
      item,
      app: this.app
    });
    return element;
  }
}
