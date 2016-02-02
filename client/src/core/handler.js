import TheatricsAPI from './api';
import Resolver from './resolver';

import EventView from '../views/event';
import PlaceView from '../views/place';


export default class Handler {
  constructor(api) {
    this.api = api;
    this.resolver = new Resolver;
    this.resolver.addRoute('event', '/event/{id:\\d+}/');
    this.resolver.addRoute('place', '/place/{id:\\d+}/');
  }

  handle(path) {
    const route = this.resolver.resolve(path);
    if (route == undefined) {
      return this.notFound();
    } else {
      return this[route.name](route.args);
    }
  }

  event({id}) {
    return this.api
      .fetchEvent(id)
      .then(event => new EventView(event));
  }

  place({id}) {
    return this.api
      .fetchPlace(id)
      .then(place => new PlaceView(place));
  }

  notFound() {
    return null;
  }
}
