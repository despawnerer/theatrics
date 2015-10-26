import axios from 'axios';

import View from '../base/view';
import Event from '../models/event';
import {capfirst, buildAPIURL} from '../utils';


const template = ({app, event}) => `
<ul class="item-images">
  <li class="item-image">
    <img data-src="${event.images[0].thumbnails['640x384']}" class="lazyload"/>
  </li>
</ul>
<h2 class="big-item-title">
  ${capfirst(event.short_title || event.title)}
</h2>
<div class="tagline">${event.tagline}</div>
<div class="item-description">${event.description}</div>
<div class="item-text">${event.body_text}</div>
`;


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
      console.log('rendering')
      this.element.innerHTML = template({
        app: this.app,
        event: this.model.data,
      });
    }
  }
}
