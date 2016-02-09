import moment from 'moment';

import View from '../base/view';
import Place from '../models/place';
import Feed from '../models/feed';
import ScheduleView from '../views/schedule-view';
import Slider from '../components/slider';
import {BigLoader} from '../components/loader';
import Pager from '../components/pager';
import {capfirst, buildAPIURL, isiOS} from '../utils';

import template from '../../templates/place.ejs';


export default class PlacePageView extends View {
  constructor({app, model}) {
    super({app, model});

    this.item = Place.from(model);
  }

  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'item-view');
    return element;
  }

  mount(element) {
    this.element = element;
    this.renderLoader();
    this.item.fetch().then(this.renderItem.bind(this));
  }

  renderItem() {
    const location = this.app.locations.get(this.item.data.location);

    this.element.innerHTML = template({
      capfirst,
      isiOS,
      app: this.app,
      location: location,
      place: this.item,
    });

    new Slider(this.element.querySelector('.item-slider'));
    new Pager(this.element.querySelector('.pager'));
    this.createScheduleView('.schedule-page > div');

    this.app.setTitle(`${this.item.getTitle()} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }

  renderLoader() {
    const loader = new BigLoader({progress: 0.25});
    this.element.innerHTML = '';
    this.element.appendChild(loader.element);
    this.app.setTitle("Площадка");
  }

  createScheduleView(selector) {
    const container = this.element.querySelector(selector);
    const schedule = new Feed(
      '/events/', {
        categories: 'theater',
        fields: 'id,title,short_title,dates,location,tagline',
        page_size: 100,
        place_id: this.item.get('id'),
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
