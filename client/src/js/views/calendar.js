import moment from 'moment';

import View from '../base/view';

import {toggleClass, range} from '../utils';

import template from '../../templates/calendar.ejs';


export default class Calendar extends View {
  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'calendar-container');
    return element;
  }

  render() {
    const today = moment().startOf('day');
    const dates = range(15).map(n => today.clone().add(n, 'days'));
    this.element.innerHTML = template({
      app: this.app,
      current: this.model.data,
      dates: dates,
    });
  }

  onModelChange() {
    if (this.model.hasChanged('location')) {
      this.render();
    } else {
      const date = this.model.get('date');
      const selector = date ? `li[data-date="${date}"]` : 'li.any';
      this.element.querySelector('.active').classList.remove('active');
      this.element.querySelector(selector).classList.add('active');
    }
  }
}
