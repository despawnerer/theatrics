const OPTION_NAME = 'location';


export default class LocationChooser {
  constructor(element, locations, options) {
    this.element = element;
    this.locations = locations;
    this.options = options;
  }

  render() {
    const currentSlug = this.getValue();
    const select = document.createElement('select');
    select.addEventListener('change', this.onSelectChange.bind(this));

    this.locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location.slug;
      option.textContent = location.name;
      if (location.slug == currentSlug) {
        option.setAttribute('selected', true);
      }
      select.appendChild(option);
    });

    this.element.appendChild(select);
  }

  onSelectChange(event) {
    const select = event.target;
    const newValue = select.options[select.selectedIndex].value;
    this.options.set(OPTION_NAME, newValue);
  }

  getValue() {
    return this.options.get(OPTION_NAME);
  }
}
