import axios from 'axios';

import View from '../base/view';
import Feed from '../models/feed';
import Loader from '../components/loader';
import {buildAPIURL, toggle, show, hide, capfirst} from '../utils';


export default class FeedView extends View {
  constructor({app, model, itemTemplate}) {
    super({app, model});

    this.itemTemplate = itemTemplate;
    this.needsClearing = false;

    this.feedLoader = new Loader({progress: 0.25});
    this.moreLoader = new Loader({progress: 0.25});
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'feed-container');
    return element;
  }

  renderInnerHTML() {
    return `
      <ol class="feed" hidden></ol>
      <div class="load-more-container" hidden>
        <button class="load-more-button" hidden>Загрузить ещё</button>
      </div>
      <div class="nothing-at-all" hidden>Ничего нет</div>
      <div class="big-loader-container" hidden></div>
    `;
  }

  mount(element) {
    this.element = element;

    this.listContainer = element.querySelector('.feed');
    this.loadMoreContainer = element.querySelector('.load-more-container');
    this.feedLoaderContainer = element.querySelector('.big-loader-container');
    this.nothingAtAll = element.querySelector('.nothing-at-all');

    this.feedLoaderContainer.appendChild(this.feedLoader.element);
    this.loadMoreContainer.appendChild(this.moreLoader.element);

    show(this.feedLoaderContainer);

    const loadMoreButton = element.querySelector('.load-more-button');
    loadMoreButton.addEventListener('click', event => this.onLoadMoreClicked(event));
    this.model.query.on('change', () => this.onQueryChange());
    this.model.on('load', items => this.onLoaded(items));
  }

  onQueryChange() {
    this.needsClearing = true;
    this.model.clear();
    this.model.fetchMore();
    show(this.feedLoaderContainer);
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.model.fetchMore();
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
    toggle(this.listContainer, hasAnything);

    this.loadMoreContainer.classList.remove('loading');
  }

  buildItemElement(item) {
    const element = document.createElement('li');
    element.setAttribute('class', 'feed-item');
    element.innerHTML = this.itemTemplate({
      item,
      capfirst,
      app: this.app,
    });
    return element;
  }
}
