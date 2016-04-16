import View from '../base/view';

import template from '../../templates/feed-place.ejs';


export default class FeedPlaceView extends View {
  getHTML() {
    const place = this.model;
    const location = this.app.locations.get(place.data.location);
    return this.app.renderTemplate(template, {place, location});
  }
}
