import axios from 'axios';
import moment from 'moment-timezone';

import View from '../base/view';
import Event from '../models/event';
import {capfirst, buildAPIURL} from '../utils';


const template = require('../../templates/single-event.ejs');


export default class SingleEventView extends View {
  constructor({app, model}) {
    model = Event.from(model);
    super({app, model});

    if (!model.isFetched()) {
      model.fetch();
    }
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
    }
  }
}
