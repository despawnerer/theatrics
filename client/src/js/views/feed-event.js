import View from '../base/view';

import template from '../../templates/feed-event.ejs';


export default class FeedEventView extends View {
  getHTML() {
    return this.app.renderTemplate(template, {event: this.model});
  }
}
