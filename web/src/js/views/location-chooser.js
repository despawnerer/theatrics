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
    const targetRouteName = (
      (this.route && this.route.name == 'place-list')
      ? 'place-list'
      : 'event-list'
    );
    return this.app.renderTemplate(template, {
      locations, targetRouteName, currentLocation});
  }

  mount(element) {
    element.addEventListener('change', event => this.onSelectChange(event));
  }

  onSelectChange(event) {
    const element = event.target;
    const url = element.value;
    trigger(window, 'navigate', url);
  }
}
