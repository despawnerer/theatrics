import TheatricsAPI from './api';
import Resolver from './resolver';

import EventPage from '../pages/event';
import PlacePage from '../pages/place';


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
      .then(data => new EventPage(this.context, {id}, data));
  }

  place({id}) {
    return this.api
      .fetchPlace(id)
      .then(data => new PlacePage(this.context, {id}, data));
  }

  notFound() {
    return null;
  }
}
