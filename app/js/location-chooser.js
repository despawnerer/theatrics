const OPTION_NAME = 'location';


export default class LocationChooser {
  constructor(locations, options) {
    this.locations = locations;
    this.options = options;

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
    this.options.set(OPTION_NAME, this.getNewValue());
  }

  getCurrentValue() {
    return this.options.get(OPTION_NAME);
  }

  getNewValue() {
    return this.element.options[this.element.selectedIndex].value;
  }
}
