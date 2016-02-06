import EventHandler from '../handlers/event';
import PlaceHandler from '../handlers/place';


export default class Router {
  constructor(context) {
    this.context = context;

    this.resolver = context.resolver;

    this.resolver.addRoute('event', '/event/{id:\\d+}/');
    this.resolver.addRoute('place', '/place/{id:\\d+}/');

    this.handlers = {
      'event': EventHandler,
      'place': PlaceHandler,
    }
  }

  getHandler(path) {
    const route = this.resolver.resolve(path);
    if (route == undefined) {
      return undefined;
    } else {
      const Handler = this.handlers[route.name];
      return new Handler(this.context, route.args);
    }
  }
}
