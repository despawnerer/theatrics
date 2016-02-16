import View from '../base/view';
import {capfirst} from '../utils';

import template from '../../templates/feed-place.ejs';


export default class FeedPlaceView extends View {
  getHTML() {
    return template({
      capfirst,
      app: this.app,
      place: this.model,
    });
  }
}
