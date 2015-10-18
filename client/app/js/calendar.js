import moment from 'moment';


export default class Calendar {
  constructor() {
    this.element = document.createElement('ol');
    this.element.setAttribute('class', 'calendar');
  }

  render() {
    let anyDateElement = this.buildAnyDateElement();
    anyDateElement.classList.add('active');
    this.element.appendChild(anyDateElement);

    let today = moment().startOf('day');
    for (let n = 0; n < 14; n++) {
      let day = today.clone().add(n, 'days');
      let element = this.buildDayElement(day);
      this.element.appendChild(element);
    }
  }

  setLocation(location) {
    if (this.location === location) {
      return;
    }
    this.location = location;
    this.element.innerHTML = '';
    this.render();
  }

  setDate(date) {
    const selector = date ? `li[data-date="${date}"]` : 'li.any';
    this.element.querySelector('.active').classList.remove('active');
    this.element.querySelector(selector).classList.add('active');
  }

  buildAnyDateElement() {
    const element = document.createElement('li');
    element.setAttribute('class', 'calendar-day any');
    element.innerHTML = `<a href="/${this.location}/events/">Самое</a>`
    return element;
  }

  buildDayElement(day) {
    const element = document.createElement('li');
    element.setAttribute('class', 'calendar-day');
    element.setAttribute('data-date', day.format('YYYY-MM-DD'));
    element.innerHTML = `
      <a href="/${this.location}/events/${day.format('YYYY-MM-DD')}/">
        ${day.format('D')}<br/>
        ${day.format('MMM')}
      </a>`;
    return element;
  }
}
