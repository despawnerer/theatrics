import axios from 'axios';
import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import Slider from '../components/slider';
import {BigLoader} from '../components/loader';
import {capfirst, buildAPIURL} from '../utils';

import template from '../../templates/single-event.ejs';


export default class SingleEventView extends View {
  constructor({app, model}) {
    super({app, model});

    this.item = Event.from(model);

    this.slider = null;
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'item-view');
    return element;
  }

  render() {
    this.renderLoader();
    this.item.fetch().then(this.renderItem.bind(this));
  }

  renderItem() {
    const event = this.item.data;
    const location = this.app.locations.get(event.location.slug);

    this.element.innerHTML = template({
      moment,
      capfirst,
      app: this.app,
      location: location,
      event: event,
      dates: this.item.getDisplayDates(),
    });

    const sliderElement = this.element.querySelector('.item-slider');
    this.slider = new Slider(sliderElement);

    this.app.setTitle(`${capfirst(event.title)} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }

  renderLoader() {
    const loader = new BigLoader({progress: 0.25});
    this.element.innerHTML = '';
    this.element.appendChild(loader.element);
    this.app.setTitle("Спектакль");
  }
}
