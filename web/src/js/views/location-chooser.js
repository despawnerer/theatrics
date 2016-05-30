import locations from '../core/locations';

import View from '../base/view';
import {trigger} from '../utils';

import template from '../../templates/location-chooser.ejs';


export default class LocationChooser extends View {
  constructor({app, location, route}) {
    super({app});

    this.location = location;
    this.route = route;
  }

  getHTML() {
    const currentLocation = this.location;
    const targetRoute = this.getTargetRoute();
    return this.app.renderTemplate(template, {
      locations, targetRoute, currentLocation});
  }

  mount(element) {
    element.addEventListener('change', event => this.onSelectChange(event));
  }

  getTargetRoute() {
    if (this.route.name == 'place-list') {
      return {name: 'place-list', args: this.route.args};
    } else if (this.route.name == 'event-list') {
      return {name: 'event-list', args: this.route.args};
    } else {
      return {name: 'event-list', args: {}};
    }
  }

  onSelectChange(event) {
    const element = event.target;
    const url = element.value;
    trigger(window, 'navigate', url);
  }
}
