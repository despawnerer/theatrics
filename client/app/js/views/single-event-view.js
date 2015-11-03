import axios from 'axios';
import moment from 'moment-timezone';

import View from '../base/view';
import Event from '../models/event';
import Slider from '../components/slider';
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

  unbind() {
    if (this.slider) {
      this.slider.unbind();
    }
    super.unbind();
  }
}
