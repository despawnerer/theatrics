import View from '../base/view';

import {trigger} from '../utils/browser';
import {toggleClass} from '../utils/elements';

import template from '../../templates/search.ejs';


export default class Search extends View {
  constructor({app, isOnSearchPage, query}) {
    super({app});

    this.isOnSearchPage = isOnSearchPage;
    this.query = query;
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      isOnSearchPage: this.isOnSearchPage,
      query: this.query,
    });
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
  }

  sync() {
    if (this.input.value != this.query) this.input.value = this.query;
    toggleClass(this.element, 'active', this.isOnSearchPage);
  }

  onOpen() {
    this.element.classList.add('active');
    this.input.focus();
  }

  onClose() {
    this.element.classList.remove('active');
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
      const url = this.getSearchPageURL();
      trigger(window, action, url);
    }, 100);
  }

  onSubmit(event) {
    event.preventDefault();
    if (this.typeTimeout) window.clearTimeout(this.typeTimeout);
    const url = this.getSearchPageURL();
    trigger(window, 'navigate', url);
  }

  getSearchPageURL() {
    const query = this.input.value;
    const path = this.app.url('search', {});
    return `${path}?q=${encodeURIComponent(query)}`;
  }
}
