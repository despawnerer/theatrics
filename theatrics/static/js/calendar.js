import moment from 'moment';


const DAYS = 14;


export default class Calendar {
  constructor(query) {
    this.query = query;

    this.element = document.createElement('ol');
    this.element.setAttribute('class', 'calendar');

    this.element.addEventListener('click', this.onClicked.bind(this));
  }

  render() {
    let anyDateElement = this.buildAnyDateElement();
    anyDateElement.classList.add('active');
    this.element.appendChild(anyDateElement);

    let today = moment().startOf('day');
    for (let n = 0; n < DAYS; n++) {
      let day = today.clone().add(n, 'days');
      let element = this.buildDayElement(day);
      this.element.appendChild(element);
    }
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
      this.setDay(dateString);
    } else {
      this.setAnyDay();
    }

    this.element.querySelector('.active').classList.remove('active');
    dayElement.classList.add('active');
  }

  setDay(dateString) {
    let day = moment(dateString);
    this.query
      .lock()
      .set('actual_since', day.unix())
      .set('actual_until', day.clone().add(1, 'days').unix())
      .apply();
  }

  setAnyDay() {
    this.query
      .lock()
      .set('actual_since', moment().unix())
      .remove('actual_until')
      .apply();
  }

  // elements

  buildAnyDateElement() {
    let element = document.createElement('li');
    element.setAttribute('class', 'calendar-day any');
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
