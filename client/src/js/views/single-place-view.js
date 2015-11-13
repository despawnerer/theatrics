import axios from 'axios';

import View from '../base/view';
import Place from '../models/place';
import Slider from '../components/slider';
import Loader from '../components/loader';
import {capfirst, buildAPIURL, isiOS} from '../utils';


const template = require('../../templates/single-place.ejs');


export default class SinglePlaceView extends View {
  constructor({app, model}) {
    model = Place.from(model);
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
    if (this.slider) {
      this.slider.unbind();
    }
    super.unbind();
  }
}
