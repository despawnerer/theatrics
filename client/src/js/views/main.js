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
    this.loader = domify(bigLoader());
    element.appendChild(this.loader);
  }

  wait() {
    show(this.loader);
  }

  setState(state) {
    hide(this.loader);
    document.title = `${state.title} — Theatrics`;

    if (!this.state.element) {
      this.element.appendChild(state.element);
    } else {
      this.element.replaceChild(state.element, this.state.element);
    }

    this.state = state;
  }
}
