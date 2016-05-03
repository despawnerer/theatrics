import locations from '../core/locations';

import View from '../base/view';

import template from '../../templates/location-chooser.ejs';


export default class LocationChooser extends View {
  getHTML() {
    const currentLocation = locations.get(this.app.settings.get('location'));
    return this.app.renderTemplate(template, {locations, currentLocation});
  }

  mount(element) {
    this.element = element;
    this.element.addEventListener('change', () => this.onSelectChange());
    this.app.settings.on('change', () => this.onSettingsChange());
  }

  onSelectChange() {
    const location = this.element.value;
    if (location !== this.app.settings.get('location')) {
      const currentRouteName = this.app.mainView.state.route.name;
      const routeName = currentRouteName == 'place-list' ? 'place-list' : 'event-list';
      const path = this.app.resolver.reverse(routeName, {location});
      this.app.router.navigate(path);
      this.app.settings.set('location', location);
    }
  }

  onSettingsChange() {
    if (this.app.settings.hasChanged('location')) {
      this.element.value = this.app.settings.get('location');
    }
  }
}
