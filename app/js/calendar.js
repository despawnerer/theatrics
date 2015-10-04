import moment from 'moment';
import addClass from 'add-class';
import removeClass from 'remove-class';
import extend from 'extend';


const DAYS = 14;


export default class Calendar {
  constructor(element, query) {
    this.element = element;
    this.query = query;

    let anyDateElement = this.buildAnyDateElement();
    addClass(anyDateElement, 'active');
    this.element.appendChild(anyDateElement);

    let today = moment().startOf('day');
    for (let n = 0; n < DAYS; n++) {
      let day = today.clone().add(n, 'days');
      let element = this.buildDayElement(day);
      this.element.appendChild(element);
    }

    this.element.addEventListener('click', this.onClicked.bind(this));
  }

  // event handlers

  onClicked(event) {
    let element = event.target;
    if (!element.matches('.calendar-day a')) {
      return;
    }

    event.preventDefault();

    let dayElement = element.parentNode;
    let dateString = dayElement.getAttribute('data-date');
    if (dateString) {
      let day = moment(dateString);
      this.loadDay(day);
    } else {
      this.loadAnyDay();
    }

    removeClass(
      this.element.querySelector('.active'),
      'active');
    addClass(
      dayElement, 'active');
  }

  loadDay(day) {
    this.query.update({
      actual_since: day.unix(),
      actual_until: day.clone().add(1, 'days').unix(),
    });
  }

  loadAnyDay() {
    this.query.lock()
      .remove('actual_until')
      .update({
        actual_since: moment().unix()
      })
      .apply();
  }

  // elements

  buildAnyDateElement() {
    let element = document.createElement('li');
    element.setAttribute('class', 'calendar-day');
    element.innerHTML = '<a href="#">Самое</a>'
    return element;
  }

  buildDayElement(day) {
    let element = document.createElement('li');
    element.setAttribute('class', 'calendar-day');
    element.setAttribute('data-date', day.format('YYYY-MM-DD'))
    element.innerHTML = `
      <a href="#">
        ${day.format('D')}<br/>
        ${day.format('MMM')}
      </a>`;
    return element;
  }
}
