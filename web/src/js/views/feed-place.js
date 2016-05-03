import View from '../base/view';

import template from '../../templates/feed-place.ejs';


export default class FeedPlaceView extends View {
  getHTML() {
    return this.app.renderTemplate(template, {place: this.model});
  }
}
