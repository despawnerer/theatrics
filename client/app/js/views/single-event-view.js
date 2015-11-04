import axios from 'axios';
import moment from 'moment-timezone';

import View from '../base/view';
import Event from '../models/event';
import Slider from '../components/slider';
import Loader from '../components/loader';
import {capfirst, buildAPIURL} from '../utils';


const template = require('../../templates/single-event.ejs');


export default class SingleEventView extends View {
  constructor({app, model}) {
    model = Event.from(model);
    super({app, model});

    this.slider = null;
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'item-view');
    return element;
  }

  render() {
    if (this.model.isFetched()) {
      this.renderItem();
    } else {
      this.renderLoader();
      this.model.fetch();
    }
  }

  renderItem() {
    const event = this.model.data;
    const location = this.app.locations.get(event.location.slug);

    this.element.innerHTML = template({
      moment,
      capfirst,
      app: this.app,
      location: location,
      event: event,
      dates: this.model.getDisplayDates(),
    });

    const imagesElement = this.element.querySelector('.item-images-container');
    this.slider = new Slider(imagesElement);

    this.app.setTitle(`${capfirst(event.title)} – ${location.name}`);
  }

  renderLoader() {
    const loader = new Loader({progress: 0.25});
    const container = document.createElement('div');
    container.setAttribute('class', 'big-loader-container');
    container.appendChild(loader.element);
    this.element.appendChild(container);
    this.app.setTitle("Спектакль");
  }

  unbind() {
    if (this.slider) {
      this.slider.unbind();
    }
    super.unbind();
  }
}
