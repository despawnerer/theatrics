import moment from 'moment';

import View from '../base/view';
import Place from '../models/place';
import Feed from '../models/feed';
import Slider from '../components/slider';
import Loader from '../components/loader';
import Pager from '../components/pager';
import {capfirst, buildAPIURL, isiOS} from '../utils';

import ScheduleView from './schedule-view';


const template = require('../../templates/single-place.ejs');


export default class SinglePlaceView extends View {
  constructor({app, model}) {
    model = Place.from(model);
    super({app, model});

    this.slider = null;

    this.schedule = new Feed(
      '/events/', {
        categories: 'theater',
        fields: 'id,title,short_title,dates,location,tagline',
        page_size: 100,
        place_id: model.get('id'),
        actual_since: moment().unix(),
      });
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
      this.model.fetch().catch(err => console.error(err))
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

    const sliderElement = this.element.querySelector('.item-slider');
    this.slider = new Slider(sliderElement);

    const pagerElement = this.element.querySelector('.pager');
    this.pager = new Pager(pagerElement);

    const scheduleElement = this.element.querySelector('.schedule-page > div');
    this.scheduleView = new ScheduleView({
      app: this.app,
      model: this.schedule,
    });
    this.scheduleView.render();
    scheduleElement.appendChild(this.scheduleView.element);

    this.app.setTitle(`${capfirst(place.title)} – ${location.name}`);
    this.app.settings.set('location', location.slug);
  }

  renderLoader() {
    const loader = new Loader({progress: 0.25});
    const container = document.createElement('div');
    container.setAttribute('class', 'big-loader-container');
    container.appendChild(loader.element);
    this.element.appendChild(container);
    this.app.setTitle("Площадка");
  }

  unbind() {
    if (this.pager) {
      this.pager.unbind();
    }
    if (this.slider) {
      this.slider.unbind();
    }
    if (this.scheduleView) {
      this.scheduleView.unbind();
    }
    super.unbind();
  }
}
