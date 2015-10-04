import axios from 'axios';

import {capfirst, buildAPIURL} from './utils';


export default class Feed {
  constructor(element, path, query) {
    this.element = element;
    this.path = path;
    this.query = query;

    this.nextURL = null;

    this.listContainer = this.element.querySelector('.list');
    this.loadMoreContainer = this.element.querySelector('.load-more-container');
    this.loadMoreButton = this.element.querySelector('.load-more-button');

    this.loadMoreButton.addEventListener('click', this.onLoadMoreClicked.bind(this));

    this.query.on('update', this.onQueryUpdate.bind(this));
  }

  onQueryUpdate() {
    this.reset();
    this.loadMore();
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.loadMore();
  }

  loadMore() {
    if (this.nextURL) {
      return axios
        .get(this.nextURL)
        .then(this.onLoaded.bind(this));
    } else {
      return axios
        .get(
          buildAPIURL(this.path),
          {
            params: this.query.get()
          })
        .then(this.onLoaded.bind(this));
    }
  }

  reset() {
    this.nextURL = null;
    this.listContainer.innerHTML = '';
    this.listContainer.setAttribute('hidden', 'hidden');
    this.loadMoreContainer.setAttribute('hidden', 'hidden');
  }

  onLoaded(response) {
    this.nextURL = response.data.next;
    if (this.nextURL) {
      this.loadMoreContainer.removeAttribute('hidden');
    } else {
      this.loadMoreContainer.setAttribute('hidden', 'hidden');
    }

    const itemList = response.data.results;
    for (let item of itemList) {
      let firstImage = item.images[0];
      let li = document.createElement('li');
      li.setAttribute('class', "list-item");
      li.innerHTML = `
        <div class="list-image-container">
          <img src="${firstImage.thumbnails['640x384']}" class="list-image"/>
        </div>
        <h2>${capfirst(item.short_title || item.title)}</h2>
        <div class="tagline">${item.tagline}</div>
        <div class="place">${item.place ? capfirst(item.place.short_title || item.place.title) : ''}</div>`;
      this.listContainer.appendChild(li);
    }

    this.listContainer.removeAttribute('hidden');
  }
}
