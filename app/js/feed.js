import axios from 'axios';
import domify from 'domify';

import {buildAPIURL, toggle, show, hide} from './utils';


const template = () => `
<div class="feed-container">
  <ol class="list" hidden></ol>
  <div class="load-more-container" hidden>
    <button class="load-more-button" hidden>Загрузить ещё</button>
  </div>
</div>
`;


export default class Feed {
  constructor(query, itemTemplate) {
    this.query = query;
    this.itemTemplate = itemTemplate;

    this.element = document.createElement('div');
    this.element.setAttribute('class', 'feed-container');

    this.nextURL = null;

    this.query.on('update', this.onQueryUpdate.bind(this));
  }

  render() {
    this.element = domify(template());

    this.listContainer = this.element.querySelector('.list');
    this.loadMoreContainer = this.element.querySelector('.load-more-container');
    this.loadMoreButton = this.element.querySelector('.load-more-button');

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
      const element = domify(this.itemTemplate(item));
      this.listContainer.appendChild(element);
    });
    show(this.listContainer);
  }
}
