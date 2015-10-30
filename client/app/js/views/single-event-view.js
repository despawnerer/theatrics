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

    if (!model.isFetched()) {
      model.fetch();
    }

    this.slider = null;
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'item-view');
    return element;
  }

  render() {
    if (this.model.isFetched()) {
      const app = this.app;
      const event = this.model.data;
      const dates = this.model.getDisplayDates();
      const location = this.app.locations.get(event.location.slug);
      this.element.innerHTML = template({
        moment,
        capfirst,
        app,
        location,
        event,
        dates,
      });

      this.slider = new Slider(
        this.element.querySelector('.item-images-container'));
    }
  }

  unbind() {
    if (this.slider) {
      this.slider.unbind();
    }
    super.unbind();
  }
}
