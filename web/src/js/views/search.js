import View from '../base/view';

import {addClass, trigger} from '../utils';

import template from '../../templates/search.ejs';


export default class Search extends View {
  constructor({app, query}) {
    super({app});
    this.query = query;
  }

  getHTML() {
    return this.app.renderTemplate(template, {query: this.query});
  }

  mount(element) {
    this.input = element.querySelector('input');
    element.addEventListener('submit', event => this.onSubmit(event));
  }

  onSubmit(event) {
    event.preventDefault();

    const query = this.input.value;
    const path = this.app.url('search', {});
    const url = `${path}?q=${encodeURIComponent(query)}`;
    trigger(window, 'navigate', url);
  }
}
