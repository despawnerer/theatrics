import domify from 'domify';
import extend from 'xtend';

import View from '../base/view';
import LocationChooser from '../views/location-chooser';

import {show, hide, bigLoader, forceScroll} from '../utils';


export default class MainView extends View {
  constructor({app}) {
    super({app});

    this.state = {
      id: null,
      path: null,
      route: null,
      title: null,
      scrollX: 0,
      scrollY: 0,
      page: null,
      element: null,
    };

    this.locationChooser = new LocationChooser({app});
  }

  mount(element) {
    this.element = element;
    this.container = element.querySelector('#view-container');

    this.loader = domify(bigLoader());
    this.loader.id = 'view-loader-container';
    this.container.appendChild(this.loader);

    const locationContainer = element.querySelector('#city');
    locationContainer.appendChild(this.locationChooser.render());
    show(locationContainer);
  }

  wait() {
    show(this.loader);
  }

  setState(state) {
    document.title = `${state.title} — Theatrics`;
    forceScroll(state.scrollX, state.scrollY);
    if (!this.state.element) {
      this.container.appendChild(state.element);
    } else {
      this.container.replaceChild(state.element, this.state.element);
    }

    hide(this.loader);
    this.state = state;
  }

  getState() {
    return extend(this.state, {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
  }
}
