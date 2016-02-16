import Page from '../base/page';
import Slider from '../components/slider';

import template from '../../templates/event.ejs';


export default class EventPage extends Page {
  constructor({app, event}) {
    super({app});

    this.event = event;
    this.location = app.locations.get(event.data.location.slug);
  }

  getHTML() {
    return this.app.renderTemplate(template, {
      location: this.location,
      event: this.event,
    });
  }

  getTitle() {
    return `${this.event.getLongTitle()} – ${this.location.name}`;
  }

  mount(element) {
    new Slider(element.querySelector('.item-slider'));
  }
}
