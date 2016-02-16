import moment from 'moment';

import View from '../base/view';

import {toggleClass, range} from '../utils';

import template from '../../templates/calendar.ejs';


export default class Calendar extends View {
  constructor({app, location, date}) {
    super({app});
    this.location = location;
    this.date = date;
  }

  getHTML() {
    const today = moment().startOf('day');
    const dates = range(15).map(n => today.clone().add(n, 'days'));
    const current = {location: this.location, date: this.date}
    return this.app.renderTemplate(template, {current, dates});
  }

  mount(element, sync=false) {
    this.element = element;

    if (sync) {
      this.updateLinks();
      this.updateActiveDate();
    }
  }

  updateLinks() {
    const days = this.element.querySelectorAll('li');
    const location = this.location;
    Array.from(days).forEach(element => {
      const link = element.querySelector('a');
      const date = element.getAttribute('data-date');
      const args = date ? {location, date} : {location};
      const url = this.app.resolver.reverse('event-list', args);
      link.setAttribute('href', url);
    });
  }

  updateActiveDate() {
    const selector = this.date ? `li[data-date="${this.date}"]` : 'li.any';
    this.element.querySelector('.active').classList.remove('active');
    this.element.querySelector(selector).classList.add('active');
  }
}
