import request from 'superagent';

import {capfirst} from './utils';


const API_PREFIX = 'http://kudago.com/public-api/v1';


export default class Feed {
  constructor(container, path, query) {
    this.container = container;
    this.path = path;
    this.query = query;

    this.nextURL = null;

    this.listContainer = this.container.querySelector('.list');
    this.loadMoreContainer = this.container.querySelector('.load-more-container');
    this.loadMoreButton = this.container.querySelector('.load-more-button');

    this.loadMoreButton.addEventListener('click', this.onLoadMoreClicked.bind(this));
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.loadMore();
  }

  loadMore() {
    let thisRequest;

    if (this.nextURL) {
      thisRequest = request.get(this.nextURL);
    } else {
      thisRequest = request
        .get(API_PREFIX + this.path)
        .query(this.query);
    }

    thisRequest
      .set('Accept', 'application/json')
      .end(this.onLoaded.bind(this));
  }

  reset() {
    this.nextURL = null;
    this.listContainer.innerHTML = '';
    this.listContainer.setAttribute('hidden', 'hidden');
    this.loadMoreContainer.setAttribute('hidden', 'hidden');
  }

  onLoaded(err, res) {
    this.nextURL = res.body.next;
    if (this.nextURL) {
      this.loadMoreContainer.removeAttribute('hidden');
    } else {
      this.loadMoreContainer.setAttribute('hidden', 'hidden');
    }

    let itemList = res.body.results;
    for (let item of itemList) {
      let firstImage = item.images[0];
      let li = document.createElement('li');
      li.setAttribute('class', "list-item");
      li.innerHTML = `
        <div class="list-image-container">
          <img src="${firstImage.thumbnails['640x384']}" class="list-image"/>
        </div>
        <h2>${capfirst(item.title)}</h2>
        <div>${item.place ? capfirst(item.place.title) : ''}</div>`;
      this.listContainer.appendChild(li);
    }

    this.listContainer.removeAttribute('hidden');
  }
}
