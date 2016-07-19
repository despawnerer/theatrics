import View from '../base/view';

import {trigger} from '../utils';

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

  mount(element) {
    this.element = element;
    this.input = element.querySelector('input');

    const onFocus = this.onFocus.bind(this);
    const onBlur = this.onBlur.bind(this);
    const onType = this.onType.bind(this);
    const onSubmit = this.onSubmit.bind(this);

    this.element.addEventListener('submit', onSubmit);
    this.input.addEventListener('focus', onFocus);
    this.input.addEventListener('blur', onBlur);
    this.input.addEventListener('keyup', onType);
    this.input.addEventListener('input', onType);
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
