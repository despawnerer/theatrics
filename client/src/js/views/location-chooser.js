import View from '../base/view';
import PlacesView from '../views/places-view';


export default class LocationChooser extends View {
  constructor({app, model}) {
    super({app, model});

    this.events.bind('change', 'onSelectChange');
    this.app.settings.on('change', this.onSettingsChange.bind(this));
  }

  createElement() {
    return document.createElement('select');
  }

  render() {
    this.app.locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location.slug;
      option.textContent = location.name;
      this.element.appendChild(option);
    });

    this.element.value = this.app.settings.get('location');
  }

  onSelectChange(event) {
    const location = this.element.value;
    if (location !== this.app.settings.get('location')) {
      const view = this.app.viewSwitcher.currentView instanceof PlacesView ? 'places' : 'events';
      const path = this.app.resolver.reverse(view, {location})
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
