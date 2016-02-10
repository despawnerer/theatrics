import moment from 'moment';

import View from '../base/view';
import Place from '../models/place';
import Feed from '../models/feed';
import ScheduleView from '../views/schedule-view';
import Slider from '../components/slider';
import Pager from '../components/pager';
import {capfirst, buildAPIURL, isiOS, bigLoader} from '../utils';

import template from '../../templates/place.ejs';


export default class PlacePageView extends View {
  getHTML() {
    return `<div class="item-view">${bigLoader()}</div>`;
  }

  mount(element) {
    this.element = element;
    this.app.setTitle("Театр");
    this.app.api
      .fetchPlace(this.model.data.get('id'))
      .then(data => this.place = new Event(data))
      .then(place => this.renderPlace(place));
  }

  renderPlace() {
    const location = this.app.locations.get(this.place.data.location);

    this.element.innerHTML = template({
      capfirst,
      isiOS,
      app: this.app,
      location: location,
      place: this.place,
    });

    new Slider(this.element.querySelector('.item-slider'));
    new Pager(this.element.querySelector('.pager'));
    this.createScheduleView('.schedule-page > div');

    this.app.setTitle(`${this.place.getTitle()} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }

  createScheduleView(selector) {
    const container = this.element.querySelector(selector);
    const schedule = new Feed(
      '/events/', {
        categories: 'theater',
        fields: 'id,title,short_title,dates,location,tagline',
        page_size: 100,
        place_id: this.place.get('id'),
        actual_since: moment().unix(),
      });
    const view = new ScheduleView({
      app: this.app,
      model: schedule,
    });
    container.appendChild(view.render());
    return view;
  }
}
