import {locations} from '../core/data';

import View from '../base/view';

import {trigger} from '../utils/browser';

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

  mount() {
    this.events.bind('change', 'onChange');
  }

  getTargetRoute() {
    if (['place-list', 'event-list'].includes(this.route.name)) {
      return this.route;
    } else {
      return {name: 'event-list', args: {}};
    }
  }

  onChange(event) {
    trigger(window, 'navigate', this.element.value);
  }
}
