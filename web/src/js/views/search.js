import View from '../base/view';

import {toggleClass} from '../utils';

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
    const input = element.querySelector('input');

    const toggle = () => toggleClass(element, 'active', Boolean(input.value));

    if (input.value) toggle();
    input.addEventListener('change', toggle);
    input.addEventListener('input', toggle);
    input.addEventListener('keyup', toggle);
  }
}
