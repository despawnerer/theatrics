import Handler from '../base/handler';
import PlacePage from '../pages/place';


export default class PlaceHandler extends Handler {
  prepare() {
    const id = this.args.id;
    return this.context.api
      .fetchPlace(id)
      .then(data => new PlacePage(this.context, {id}, data));
  }
}
