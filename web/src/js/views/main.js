import View from '../base/view';
import LocationChooser from '../views/location-chooser';
import Search from '../views/search';

import {toggle, show, replace, bigLoader} from '../utils';


export default class MainView extends View {
  constructor({app, state}) {
    super({app});

    this.state = state;

    this.locationChooser = new LocationChooser({
      app,
      route: state.route,
      location: state.location
    });

    this.search = new Search({
      app,
      isOnSearchPage: state.route.name == 'search',
      query: state.route.name == 'search' ? state.query.q : ''
    });
  }

  sync() {
    const containers = {
      view: document.querySelector('#view-container'),
      city: document.querySelector('#city'),
      search: document.querySelector('#search'),
      loader: document.querySelector('#view-loader-container'),
    }

    this.locationChooser.renderInto(containers.city);
    this.search.renderInto(containers.search);
    document.title = this.getTitle();

    toggle(containers.loader, this.state.isWaiting);
    show(containers.city);
    show(containers.search);

    const oldElement = this.findViewElement(containers.view);
    const newElement = this.state.element;
    if (oldElement) {
      replace(oldElement, newElement);
    } else if (newElement) {
      containers.view.appendChild(newElement);
    }

    // this, for reasons unknown to me, makes Chrome and FF correctly
    // remember scroll positions when switching views
    window.scrollTo(window.scrollX, window.scrollY);
  }

  getTitle() {
    if (this.state.page) {
      return `${this.state.page.getTitle()} – Theatrics`;
    } else {
      return 'Theatrics';
    }
  }

  findViewElement(container) {
    return Array.from(container.children).find(node => node.id != 'view-loader-container');
  }
}
