import View from '../base/view';


const SETTING_NAME = 'location';


export default class LocationChooser extends View {
  constructor({app, model}) {
    super({app, model});

    this.events.bind('change', 'onSelectChange');
  }

  createElement() {
    return document.createElement('select');
  }

  render() {
    const currentValue = this.getCurrentValue();
    this.app.locations.forEach(location => {
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
    this.app.settings.set(SETTING_NAME, this.getNewValue());
  }

  getCurrentValue() {
    return this.app.settings.get(SETTING_NAME);
  }

  getNewValue() {
    return this.element.options[this.element.selectedIndex].value;
  }
}
