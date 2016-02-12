import View from '../base/view';
import {clear, toggle, show, hide, loader} from '../utils';


export default class FeedView extends View {
  constructor({app, itemView, itemModel, feed}) {
    super({app});

    this.itemView = itemView;
    this.itemModel = itemModel;
    this.feed = feed;
  }

  getHTML() {
    return `
      <div class="feed-container">
        <ol class="feed" hidden></ol>
        <div class="load-more-container" hidden>
          <button class="load-more-button" hidden>Загрузить ещё</button>
          ${loader()}
        </div>
        <div class="nothing-at-all" hidden>Ничего нет</div>
        <div class="big-loader-container">
          ${loader()}
        </div>
      </div>
    `;
  }

  mount(element) {
    this.element = element;

    this.listContainer = element.querySelector('.feed');
    this.loadMoreContainer = element.querySelector('.load-more-container');
    this.loadMoreButton = element.querySelector('.load-more-button');
    this.feedLoader = element.querySelector('.big-loader-container');
    this.nothingAtAll = element.querySelector('.nothing-at-all');

    this.loadMoreButton.addEventListener('click', event => this.onLoadMoreClicked(event));

    this.loadNewFeed();
  }

  onLoadMoreClicked(event) {
    event.preventDefault();
    this.loadMore();
  }

  loadNewFeed() {
    show(this.feedLoader);
    this.feed
      .fetchNext()
      .then(data => {
        const hasMore = this.feed.hasMore();
        const hasAnything = this.feed.hasAnything();

        clear(this.listContainer);
        this.appendItemsFromData(data);

        hide(this.feedLoader);
        show(this.listContainer);
        toggle(this.loadMoreContainer, hasMore);
        toggle(this.nothingAtAll, !hasAnything);
        toggle(this.listContainer, hasAnything);
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
    this.listContainer.appendChild(fragment);
  }

  buildItemElement(itemData) {
    const item = new this.itemModel(itemData);
    const view = new this.itemView({app: this.app, model: item});
    return view.render();
  }
}
