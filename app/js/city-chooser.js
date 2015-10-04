import axios from 'axios';

import {buildAPIURL} from './utils';


export default class CityChooser {
  constructor(element, query) {
    this.element = element;
    this.query = query;

    this.select = this.element.querySelector('select');
    this.initialValue = this.getValue();

    this.select.addEventListener('change', this.onSelectChange.bind(this));

    this.loadCityList();
  }

  onSelectChange(event) {
    this.query.update({location: this.getValue()});
  }

  loadCityList() {
    return axios
      .get(
        buildAPIURL('/locations/'),
        {
          params: {
            lang: 'ru',
            fields: 'name,slug,timezone',
            order_by: 'name'
          }
        })
      .then(this.onLoaded.bind(this));
  }

  onLoaded(response) {
    this.select.innerHTML = '';
    for (let location of response.data) {
      let option = document.createElement('option');
      option.value = location.slug;
      option.textContent = location.name;
      option.setAttribute('data-timezone', location.timezone);
      if (option.value == this.initialValue) {
        option.setAttribute('selected', true);
      }
      this.select.appendChild(option);
    }
  }

  getValue() {
    return this.select.options[this.select.selectedIndex].value;
  }
}
