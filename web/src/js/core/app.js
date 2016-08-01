import 'lazysizes';

import moment from 'moment';
import qs from 'query-string';

import TheatricsAPI from './api';
import Resolver from './resolver';
import Router from './router';
import * as handlers from './handlers';

import {capfirst} from '../utils/strings';
import {merge} from '../utils/objects';
import {isiOS} from '../utils/browser';
import {getMapURL} from '../utils/services';
import {
  formatURL,
  formatPriceRange,
  formatDuration,
  formatPhoneNumber
} from '../utils/formatting';
import {
  loader,
  bigLoader,
  preventBreakingRanges,
  preventBreakingOrdinals,
  unbreakable
} from '../utils/html';


export default class App {
  constructor() {
    this.api = new TheatricsAPI();

    this.resolver = new Resolver();
    this.resolver.addRoute('index', '/');
    this.resolver.addRoute('location', '/{location:[a-z\-]+}/');
    this.resolver.addRoute('event-list', '/{location:[a-z\-]+}/events/');
    this.resolver.addRoute(
      'event-list',
      '/{location:[a-z\-]+}/events/{date:\\d\\d\\d\\d-\\d\\d-\\d\\d}/');
    this.resolver.addRoute('place-list', '/{location:[a-z\-]+}/places/');
    this.resolver.addRoute('search', '/{location:[a-z\-]+}/search/');
    this.resolver.addRoute('event', '/event/{id:\\d+}/');
    this.resolver.addRoute('place', '/place/{id:\\d+}/');

    this.router = new Router();
    this.router.addHandler('index', handlers.index);
    this.router.addHandler('search', handlers.search);
    this.router.addHandler('location', handlers.location);
    this.router.addHandler('event-list', handlers.eventList);
    this.router.addHandler('place-list', handlers.placeList);
    this.router.addHandler('event', handlers.event);
    this.router.addHandler('place', handlers.place);
    this.router.setNotFoundHandler(handlers.notFound);

    this.templateContext = {
      loader,
      bigLoader,
      moment,
      capfirst,
      isiOS,
      getMapURL,
      formatURL,
      formatPriceRange,
      formatDuration,
      formatPhoneNumber,
      preventBreakingRanges,
      preventBreakingOrdinals,
      unbreakable,
      merge,
      url: this.url.bind(this),
      app: this,
    }
  }

  url(name, args, query=null) {
    const path = this.resolver.reverse(name, args);
    if (query) {
      return `${path}?${qs.stringify(query)}`;
    } else {
      return path;
    }
  }

  renderTemplate(template, context={}) {
    return template(merge(this.templateContext, context));
  }
}
