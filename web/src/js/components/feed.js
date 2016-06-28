import Events from 'events-mixin';

import {clear, toggle, show, hide} from '../utils';


export default class Feed {
  constructor(element, feed, buildItemElement) {
    this.element = element;
    this.feed = feed;
    this.buildItemElement = buildItemElement;

    const selectors = {
      itemsContainer: element.getAttribute('data-items-container'),
      loadMoreContainer: element.getAttribute('data-load-more-container'),
      loadMoreButton: element.getAttribute('data-load-more-button'),
      loader: element.getAttribute('data-loader'),
      noItemsMessage: element.getAttribute('data-no-items-message'),
    }

    this.itemsContainer = element.querySelector(selectors.itemsContainer);
    this.loadMoreContainer = element.querySelector(selectors.loadMoreContainer);
    this.loadMoreButton = element.querySelector(selectors.loadMoreButton);
    this.loader = element.querySelector(selectors.loader);
    this.noItemsMessage = element.querySelector(selectors.noItemsMessage);

    this.events = new Events(element, this);
    this.events.bind(`click ${selectors.loadMoreButton}`, 'onLoadMoreClicked');
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.loadMore();
  }

  loadNewFeed() {
    show(this.loader);
    this.feed
      .fetchNext()
      .then(data => {
        const hasMore = this.feed.hasMore();
        const hasAnything = this.feed.hasAnything();

        clear(this.itemsContainer);
        this.appendItemsFromData(data);

        hide(this.loader);
        show(this.itemsContainer);
        toggle(this.loadMoreContainer, hasMore);
        toggle(this.noItemsMessage, !hasAnything);
        toggle(this.itemsContainer, hasAnything);
      });
  }

  loadMore() {
    this.loadMoreContainer.classList.add('loading');
    this.feed
      .fetchNext()
      .then(data => {
        this.appendItemsFromData(data);

        toggle(this.loadMoreContainer, this.feed.hasMore());
        this.loadMoreContainer.classList.remove('loading');
      });
  }

  appendItemsFromData(data) {
    const fragment = document.createDocumentFragment();
    data.forEach(itemData => {
      const element = this.buildItemElement(itemData);
      fragment.appendChild(element);
    });
    this.itemsContainer.appendChild(fragment);
  }
}
