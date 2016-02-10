import axios from 'axios';
import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import Slider from '../components/slider';
import {capfirst, buildAPIURL, bigLoader} from '../utils';

import template from '../../templates/event.ejs';


export default class EventPageView extends View {
  getHTML() {
    return `<div class="item-view">${bigLoader()}</div>`;
  }

  mount(element) {
    this.element = element;
    this.app.setTitle("Спектакль");
    this.app.api
      .fetchEvent(this.model.data.get('id'))
      .then(data => this.event = new Event(data))
      .then(event => this.renderEvent(event));
  }

  renderEvent(event) {
    const location = this.app.locations.get(this.event.data.location.slug);

    this.element.innerHTML = template({
      moment,
      capfirst,
      app: this.app,
      location: location,
      event: this.event,
    });

    new Slider(this.element.querySelector('.item-slider'));

    this.app.setTitle(`${this.event.getLongTitle()} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }
}
