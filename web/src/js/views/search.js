import View from '../base/view';

import {trigger} from '../utils/browser';
import {toggleClass} from '../utils/elements';

import template from '../../templates/search.ejs';


export default class Search extends View {
  constructor({app, isOnSearchPage, location, query}) {
    super({app});

    this.isOnSearchPage = isOnSearchPage;
    this.location = location;
    this.query = query || '';

    this.onClose = this.onClose.bind(this);
  }

  getHTML() {
    const {isOnSearchPage, query, location} = this;
    const searchURL = this.getSearchPageURL();
    return this.app.renderTemplate(template, {isOnSearchPage, query, searchURL});
  }

  mount() {
    this.input = this.element.querySelector('input');
    this.events.bind('click .icon-search', 'onOpen');
    this.events.bind('click .icon-close', 'onClose');
    this.events.bind('submit', 'onSubmit');
    this.events.bind('focus input', 'onFocus');
    this.events.bind('blur input', 'onBlur');
    this.events.bind('keyup input', 'onType');
    this.events.bind('input input', 'onType');
    window.addEventListener('closekeyboard', this.onClose);
  }

  unmount() {
    window.removeEventListener('closekeyboard', this.onClose);
  }

  sync() {
    if (this.input.value != this.query) this.input.value = this.query;
    this.element.action = this.getSearchPageURL();
    toggleClass(this.element, 'active', this.isOnSearchPage);
  }

  onOpen() {
    this.element.classList.add('active');
    this.input.focus();
  }

  onClose() {
    this.element.classList.remove('active');
    this.input.blur();
  }

  onFocus() {
    this.element.classList.add('active');
  }

  onBlur() {
    if (this.input.value) return;
    this.element.classList.remove('active');
  }

  onType(event) {
    if (this.input.value == this.query) return;
    if (this.typeTimeout) window.clearTimeout(this.typeTimeout);
    this.typeTimeout = window.setTimeout(() => {
      const action = this.isOnSearchPage ? 'redirect' : 'navigate';
      const url = this.getSearchQueryURL();
      trigger(window, action, url);
    }, 100);
  }

  onSubmit(event) {
    event.preventDefault();
    if (this.typeTimeout) window.clearTimeout(this.typeTimeout);
    const url = this.getSearchQueryURL();
    trigger(window, 'navigate', url);
  }

  getSearchPageURL() {
    const location = this.location.slug;
    return this.app.url('search', {location});
  }

  getSearchQueryURL() {
    const q = this.input.value;
    const location = this.location.slug;
    return this.app.url('search', {location}, {q});
  }
}
