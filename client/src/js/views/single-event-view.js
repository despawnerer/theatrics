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

  renderLoader() {
    const loader = new BigLoader({progress: 0.25});
    this.element.innerHTML = '';
    this.element.appendChild(loader.element);
    this.app.setTitle("Спектакль");
  }
}
