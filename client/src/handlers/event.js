import Handler from '../base/handler';
import EventPage from '../pages/event';


export default class EventHandler extends Handler {
  prepare() {
    const id = this.args.id;
    return this.context.api
      .fetchEvent(id)
      .then(data => new EventPage(this.context, {id}, data));
  }
}
