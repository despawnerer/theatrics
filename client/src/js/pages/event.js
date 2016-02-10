import axios from 'axios';
import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import Slider from '../components/slider';
import {capfirst, buildAPIURL, bigLoader} from '../utils';

import template from '../../templates/event.ejs';


export default class EventPageView extends View {
  constructor({app, model}) {
    super({app, model});

    this.item = Event.from(model);
  }

  getHTML() {
    return `<div class="item-view">${bigLoader()}</div>`;
  }

  mount(element) {
    this.element = element;
    this.app.setTitle("Спектакль");
    this.item.fetch().then(this.renderItem.bind(this));
  }

  renderItem() {
    const location = this.app.locations.get(this.item.data.location.slug);

    this.element.innerHTML = template({
      moment,
      capfirst,
      app: this.app,
      location: location,
      event: this.item,
    });

    this.slider = new Slider(this.element.querySelector('.item-slider'));

    this.app.setTitle(`${this.item.getLongTitle()} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }
}
