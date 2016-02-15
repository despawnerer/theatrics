import domify from 'domify';

import View from '../base/view';

import {show, hide, bigLoader} from '../utils';


export default class MainView extends View {
  constructor({app}) {
    super({app});

    this.state = {
      page: null,
      element: null,
      title: null,
      route: null,
    };
  }

  mount(element) {
    this.element = element;
    this.container = element.querySelector('#view-container');

    this.loader = domify(bigLoader());
    this.container.appendChild(this.loader);
  }

  wait() {
    show(this.loader);
  }

  setState(state) {
    hide(this.loader);
    document.title = `${state.title} — Theatrics`;

    if (!this.state.element) {
      this.container.appendChild(state.element);
    } else {
      this.container.replaceChild(state.element, this.state.element);
    }

    this.state = state;
  }
}
