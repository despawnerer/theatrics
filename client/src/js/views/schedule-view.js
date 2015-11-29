import moment from 'moment';

import View from '../base/view';
import Event from '../models/event';
import {BigLoader} from '../components/loader';
import {capfirst} from '../utils';

import template from '../../templates/schedule.ejs';


export default class ScheduleView extends View {
  constructor({app, model, location}) {
    super({app, model});

    this.onLoaded = this.onLoaded.bind(this);

    this.model.on('load', this.onLoaded);
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'schedule');
    return element;
  }

  render() {
    if (this.model.items === null) {
      this.renderLoader();
      this.model.loadMore().catch(err => console.error(err)); // FIXME: loadAll()
    } else {
      this.renderItems();
    }
  }

  renderLoader() {
    const loader = new BigLoader({progress: 0.25});
    this.element.innerHTML = '';
    this.element.appendChild(loader.element);
  }

  renderItems() {
    const eventList = this.model.items.map(item => new Event(item));
    const eventsByDate = this.getFutureEventsByDate(eventList);
    this.element.innerHTML = template({
      capfirst,
      moment,
      app: this.app,
      items: eventsByDate,
    });
  }

  onLoaded() {
    this.render();
  }

  unbind() {
    super.unbind();
    this.model.removeListener('load', this.onLoaded);
  }

  getFutureEventsByDate(eventList) {
    const eventsByDate = [];
    eventList.forEach(event => {
      event.getFutureDates().forEach(date => {
        eventsByDate.push({date, event});
      });
    });
    return eventsByDate.sort((item1, item2) => {
      return item1.date.start - item2.date.start;
    });
  }
}
