import TheatricsAPI from './api';
import Resolver from './resolver';

import EventView from '../views/event';
import PlaceView from '../views/place';


export default class Router {
  constructor(context) {
    this.context = context;

    this.api = context.api;
    this.resolver = context.resolver;

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
      .then(data => new EventView(this.context, data));
  }

  place({id}) {
    return this.api
      .fetchPlace(id)
      .then(data => new PlaceView(this.context, data));
  }

  notFound() {
    return null;
  }
}
