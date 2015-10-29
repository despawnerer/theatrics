import moment from 'moment';

import View from '../base/view';


export default class Calendar extends View {
  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'nav-container');
    return element;
  }

  render() {
    this.element.innerHTML = '';

    const listElement = document.createElement('ol');
    listElement.setAttribute('class', 'calendar');
    this.element.appendChild(listElement);

    const anyDateElement = this.buildAnyDateElement();
    anyDateElement.classList.toggle('active', !this.model.has('date'));
    listElement.appendChild(anyDateElement);

    const today = moment().startOf('day');
    for (let n = 0; n < 14; n++) {
      const day = today.clone().add(n, 'days');
      const element = this.buildDayElement(day);
      const date = day.format('YYYY-MM-DD');
      element.classList.toggle('active', this.model.get('date') === date);
      listElement.appendChild(element);
    }
  }

  buildAnyDateElement() {
    const targetState = this.model.clone().remove('date');
    const target = this.app.resolver.reverse('events', targetState.data);
    const element = document.createElement('li');
    element.setAttribute('class', 'calendar-day any');
    element.innerHTML = `<a href="${target}">Самое</a>`
    return element;
  }

  buildDayElement(day) {
    const dateString = day.format('YYYY-MM-DD');
    const targetState = this.model.clone().set('date', dateString);
    const target = this.app.resolver.reverse('events', targetState.data);
    const element = document.createElement('li');
    element.setAttribute('class', 'calendar-day');
    element.setAttribute('data-date', dateString);
    element.innerHTML = `
      <a href="${target}">${day.format('D')}<br/>${day.format('MMM')}</a>`;
    return element;
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
