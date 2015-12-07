import moment from 'moment';

import View from '../base/view';
import Place from '../models/place';
import Feed from '../models/feed';
import Slider from '../components/slider';
import {BigLoader} from '../components/loader';
import Pager from '../components/pager';
import {capfirst, buildAPIURL, isiOS} from '../utils';

import ScheduleView from './schedule-view';

import template from '../../templates/single-place.ejs';


export default class SinglePlaceView extends View {
  constructor({app, model}) {
    model = Place.from(model);
    super({app, model});

    this.slider = null;
    this.pager = null;
    this.scheduleView = null;
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
    const place = this.model.data;
    const location = this.app.locations.get(place.location);

    this.element.innerHTML = template({
      capfirst,
      isiOS,
      app: this.app,
      location: location,
      place: place,
    });

    this.slider = new Slider(this.element.querySelector('.item-slider'));
    this.pager = new Pager(this.element.querySelector('.pager'));
    this.scheduleView = this.createScheduleView('.schedule-page > div');

    this.app.setTitle(`${capfirst(place.title)} – ${location.name}`);
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
        place_id: this.model.get('id'),
        actual_since: moment().unix(),
      });
    const view = new ScheduleView({
      app: this.app,
      model: schedule,
    });
    view.render();
    container.appendChild(view.element);
    return view;
  }

  unbind() {
    this.unbindIfPresent(this.pager);
    this.unbindIfPresent(this.slider);
    this.unbindIfPresent(this.scheduleView);
    super.unbind();
  }

  unbindIfPresent(something) {
    if (something) {
      something.unbind();
    }
  }
}
