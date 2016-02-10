import moment from 'moment';

import View from '../base/view';

import {toggleClass, range} from '../utils';

import template from '../../templates/calendar.ejs';


export default class Calendar extends View {
  getHTML() {
    const today = moment().startOf('day');
    const dates = range(15).map(n => today.clone().add(n, 'days'));
    return template({
      app: this.app,
      current: this.model.data,
      dates: dates,
      buildURL: this.buildURL.bind(this),
    });
  }

  onModelChange() {
    if (this.model.hasChanged('location')) this.updateLinks();
    if (this.model.hasChanged('date')) this.updateActiveDate();
  }

  updateLinks() {
    const location = this.model.get('location');
    const days = this.element.querySelectorAll('li');
    Array.from(days).forEach(element => {
      const link = element.querySelector('a');
      const date = element.getAttribute('data-date');
      link.setAttribute('href', this.buildURL(location, date));
    });
  }

  updateActiveDate() {
    const date = this.model.get('date');
    const selector = date ? `li[data-date="${date}"]` : 'li.any';
    this.element.querySelector('.active').classList.remove('active');
    this.element.querySelector(selector).classList.add('active');
  }

  buildURL(location, date) {
    const args = date ? {location, date} : {location};
    return this.app.resolver.reverse('event-list', args);
  }
}
