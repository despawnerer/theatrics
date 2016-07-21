import moment from 'moment';
import calendar from 'calendar';

import View from '../base/view';
import Toggle from '../components/toggle';
import Slider from '../components/slider';

import {toggleClass, hide, range, rotateLeft} from '../utils';

import template from '../../templates/calendar.ejs';


export default class Calendar extends View {
  constructor({app, location, date}) {
    super({app});

    this.location = location;
    this.date = date;
  }

  getHTML() {
    const today = moment.tz(this.location.timezone).startOf('day');
    const current = {location: this.location, date: this.date};
    const quickDates = range(17).map(n => today.clone().add(n, 'days'));
    const firstDayOfWeek = moment.localeData().firstDayOfWeek();
    const daysOfWeek = rotateLeft(moment.weekdaysMin(), firstDayOfWeek);
    const dateToString = this.dateToString;

    const cal = new calendar.Calendar(firstDayOfWeek);
    const months = range(3).map(n => {
      const date = today.clone().startOf('month').add(n, 'months');
      return {
        name: date.format('MMMM'),
        number: date.month(),
        weekDates: cal.monthDates(date.year(), date.month(), moment),
      }
    });

    return this.app.renderTemplate(template, {
      today, current, quickDates, daysOfWeek, months, dateToString});
  }

  mount(sync=false) {
    new Toggle(this.element.querySelector('.custom-date-button'), this.element);
    new Slider(this.element.querySelector('.calendar'), false);

    this.events.bind('click .calendar .months-container', 'hideCalendar');

    if (sync) {
      this.hideCalendar();
      this.updateLinks();
      this.updateActiveDate();
    }
  }

  hideCalendar() {
    const doHide = () => hide(this.element.querySelector('.calendar-box'));
    window.requestAnimationFrame(doHide);
  }

  updateLinks() {
    const links = this.element.querySelectorAll('a.calendar-day');
    const location = this.location.slug;
    Array.from(links).forEach(element => {
      const date = element.getAttribute('data-date');
      const args = date ? {location, date} : {location};
      const url = this.app.url('event-list', args);
      element.setAttribute('href', url);
    });
  }

  updateActiveDate() {
    Array
      .from(this.element.querySelectorAll('a.calendar-day.active'))
      .forEach(element => element.classList.remove('active'));

    const dateString = this.dateToString(this.date);
    const selector =
      dateString
      ? `a.calendar-day[data-date="${dateString}"]`
      : 'a.calendar-day.any';
    Array
      .from(this.element.querySelectorAll(selector))
      .forEach(element => element.classList.add('active'));
  }

  dateToString(date) {
    return date ? date.format('YYYY-MM-DD') : null;
  }
}
