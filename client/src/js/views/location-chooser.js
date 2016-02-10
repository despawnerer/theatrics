import View from '../base/view';
import PlaceListView from '../pages/place-list';

import template from '../../templates/location-chooser.ejs';


export default class LocationChooser extends View {
  getHTML() {
    const currentLocation = this.app.locations.get(
      this.app.settings.get('location'));
    return template({
      locations: this.app.locations,
      currentLocation: currentLocation
    });
  }

  mount(element) {
    this.element = element;
    this.element.addEventListener('change', () => this.onSelectChange());
    this.app.settings.on('change', () => this.onSettingsChange());
  }

  onSelectChange() {
    const location = this.element.value;
    if (location !== this.app.settings.get('location')) {
      const routeName = this.app.viewSwitcher.state.view instanceof PlaceListView ? 'place-list' : 'event-list';
      const path = this.app.resolver.reverse(routeName, {location})
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
