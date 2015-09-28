import moment from 'moment';
import ru from 'moment/locale/ru';
import addClass from 'add-class';
import removeClass from 'remove-class';
import extend from 'extend';


const DAYS = 14;


export default class Calendar {
  constructor(container, feed) {
    this.container = container;
    this.feed = feed;

    this.baseQuery = this.feed.query;

    let anyDateElement = this.buildAnyDateElement();
    addClass(anyDateElement, 'active');
    this.container.appendChild(anyDateElement);

    let today = moment().startOf('day');
    for (let n = 0; n < DAYS; n++) {
      let day = today.clone().add(n, 'days');
      let element = this.buildDayElement(day);
      this.container.appendChild(element);
    }

    this.container.addEventListener('click', this.onClicked.bind(this));
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
      this.load(this.getDayQuery(day))
    } else {
      this.load(this.getAnyDateQuery())
    }

    removeClass(
      this.container.querySelector('.active'),
      'active');
    addClass(
      dayElement, 'active');
  }

  load(query) {
    let newQuery = extend({}, this.baseQuery, query);
    this.feed.reset();
    this.feed.query = newQuery;
    this.feed.loadMore();
  }

  getDayQuery(day) {
    return {
      actual_since: day.unix(),
      actual_until: day.clone().add(1, 'days').unix(),
    }
  }

  getAnyDateQuery() {
    return {
      actual_since: moment().unix(),
    }
  }

  // elements

  buildAnyDateElement() {
    let element = document.createElement('li');
    element.setAttribute('class', 'calendar-day');
    element.innerHTML = '<a href="#">Всё</a>'
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
