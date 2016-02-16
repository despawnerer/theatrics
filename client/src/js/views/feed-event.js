import View from '../base/view';
import {capfirst} from '../utils';

import template from '../../templates/feed-event.ejs';


export default class FeedEventView extends View {
  getHTML() {
    return template({
      capfirst,
      app: this.app,
      event: this.model,
    });
  }
}
