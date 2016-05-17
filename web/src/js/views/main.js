import domify from 'domify';

import View from '../base/view';
import LocationChooser from '../views/location-chooser';

import {show, hide, bigLoader} from '../utils';


export default class MainView extends View {
  constructor({app}) {
    super({app});

    this.state = {
      id: null,
      route: null,
      page: null,
      element: null,
    };
  }

  mount(element) {
    this.element = element;
    this.container = element.querySelector('#view-container');
    this.locationContainer = element.querySelector('#city');

    this.loader = domify(bigLoader());
    this.loader.id = 'view-loader-container';
    this.container.appendChild(this.loader);
  }

  wait() {
    show(this.loader);
  }

  setState(state) {
    document.title = `${state.page.getTitle()} – Theatrics`;

    if (!this.state.element) {
      this.container.appendChild(state.element);
    } else {
      this.container.replaceChild(state.element, this.state.element);
    }

    const locationChooser = new LocationChooser({
      app: this.app,
      route: state.route,
      location: state.location,
    });
    locationChooser.renderInto(this.locationContainer);
    show(this.locationContainer);

    hide(this.loader);
    this.state = state;
  }
}
