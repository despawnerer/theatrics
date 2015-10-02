import request from 'superagent';


const API_PREFIX = 'http://kudago.com/public-api/v1';


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
    request
      .get(API_PREFIX + '/locations/')
      .query({
        lang: 'ru',
        fields: 'name,slug,timezone',
        order_by: 'name'
      })
      .set('Accept', 'application/json')
      .end(this.onLoaded.bind(this));
  }

  onLoaded(err, res) {
    this.select.innerHTML = '';
    for (let location of res.body) {
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
