import axios from 'axios';

import {capfirst, buildAPIURL, toggle, show, hide} from './utils';


export default class Feed {
  constructor(query) {
    this.query = query;

    this.element = document.createElement('div');
    this.element.setAttribute('class', 'feed-container');

    this.nextURL = null;

    this.query.on('update', this.onQueryUpdate.bind(this));
  }

  render() {
    this.listContainer = document.createElement('ol');
    this.listContainer.className = 'list';
    this.listContainer.setAttribute('hidden', 'hidden');
    this.element.appendChild(this.listContainer);

    this.loadMoreContainer = document.createElement('div');
    this.loadMoreContainer.className = 'load-more-container';
    this.loadMoreContainer.setAttribute('hidden', 'hidden');
    this.element.appendChild(this.loadMoreContainer);

    this.loadMoreButton = document.createElement('a');
    this.loadMoreButton.className = 'load-more-button';
    this.loadMoreButton.setAttribute('href', '#')
    this.loadMoreButton.textContent = "Загрузить ещё";
    this.loadMoreContainer.appendChild(this.loadMoreButton);

    this.loadMoreButton.addEventListener('click', this.onLoadMoreClicked.bind(this));
  }

  // event handlers

  onQueryUpdate() {
    this.reset();
    this.loadMore();
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.loadMore();
  }

  // loading

  loadMore() {
    if (this.nextURL) {
      return axios
        .get(this.nextURL)
        .then(this.onLoaded.bind(this));
    } else {
      return axios
        .get(
          buildAPIURL(this.query.path),
          {
            params: this.query.params
          })
        .then(this.onLoaded.bind(this));
    }
  }

  reset() {
    this.nextURL = null;
    this.listContainer.innerHTML = '';
    hide(this.listContainer);
    hide(this.loadMoreContainer);
  }

  onLoaded(response) {
    this.nextURL = response.data.next;
    toggle(this.loadMoreContainer, this.nextURL);

    const itemList = response.data.results;
    itemList.forEach(item => {
      const element = this.buildItemElement(item);
      this.listContainer.appendChild(element);
    });
    show(this.listContainer);
  }

  // elements

  buildItemElement(item) {
    const firstImage = item.images[0];
    const li = document.createElement('li');
    li.setAttribute('class', "list-item");
    li.innerHTML = `
      <div class="list-image-container">
        <img data-src="${firstImage.thumbnails['640x384']}" class="list-image lazyload"/>
      </div>
      <h2 class="item-header">${capfirst(item.short_title || item.title)}</h2>
      <div class="tagline">${item.tagline}</div>
      <div class="place">${item.place ? capfirst(item.place.short_title || item.place.title) : ''}</div>`;
    return li;
  }
}
