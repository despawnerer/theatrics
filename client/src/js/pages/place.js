import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import Place from '../models/place';
import ScheduleView from '../views/schedule';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {capfirst, isiOS, bigLoader, clear} from '../utils';

import template from '../../templates/place.ejs';


export default class PlacePageView extends View {
  getHTML() {
    return `<div class="item-view">${bigLoader()}</div>`;
  }

  mount(element) {
    this.element = element;
    this.app.setTitle("Театр");
    this.app.api
      .fetchPlace(this.model.get('id'))
      .then(data => this.place = new Place(data))
      .then(place => this.renderPlace(place));
  }

  renderPlace() {
    const location = this.app.locations.get(this.place.data.location);

    this.element.innerHTML = template({
      capfirst,
      isiOS,
      bigLoader,
      app: this.app,
      location: location,
      place: this.place,
    });

    new Slider(this.element.querySelector('.item-slider'));
    new Pager(this.element.querySelector('.pager'));
    this.loadSchedule(this.element.querySelector('.schedule-page > div'));

    this.app.setTitle(`${this.place.getTitle()} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }

  loadSchedule(container) {
    this.app.api
      .fetchEventsInPlace(this.place.get('id'))
      .then(data => {
        const dates = data
          .map(itemData => new Event(itemData))
          .map(event => event.getFutureDates())
          .reduce((a, b) => a.concat(b), [])
          .sort((date1, date2) => date1.start - date2.start)
          .map(date => this.momentizeDate(date));
        const view = new ScheduleView({app: this.app, dates: dates});
        clear(container);
        container.appendChild(view.render());
      });
  }

  momentizeDate(date) {
    const location = this.app.locations.get(date.event.data.location.slug);
    return {
      start: moment.unix(date.start).tz(location.timezone),
      end: date.end ? moment.unix(date.end).tz(location.timezone) : null,
      event: date.event,
    }
  }
}
