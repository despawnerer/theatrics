import domify from 'domify';

import View from '../base/view';
import LocationChooser from '../views/location-chooser';

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

    this.locationChooser = new LocationChooser({app});
  }

  mount(element) {
    this.element = element;
    this.container = element.querySelector('#view-container');

    this.loader = domify(bigLoader());
    this.container.appendChild(this.loader);

    const locationContainer = element.querySelector('#city');
    locationContainer.appendChild(this.locationChooser.render());
    show(locationContainer);
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
