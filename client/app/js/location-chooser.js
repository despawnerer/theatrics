const SETTING_NAME = 'location';


export default class LocationChooser {
  constructor(locations, settings) {
    this.locations = locations;
    this.settings = settings;

    this.element = document.createElement('select');

    this.element.addEventListener('change', this.onSelectChange.bind(this));
  }

  render() {
    const currentValue = this.getCurrentValue();
    this.locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location.slug;
      option.textContent = location.name;
      if (location.slug == currentValue) {
        option.setAttribute('selected', true);
      }
      this.element.appendChild(option);
    });
  }

  onSelectChange(event) {
    this.settings.set(SETTING_NAME, this.getNewValue());
  }

  getCurrentValue() {
    return this.settings.get(SETTING_NAME);
  }

  getNewValue() {
    return this.element.settings[this.element.selectedIndex].value;
  }
}
