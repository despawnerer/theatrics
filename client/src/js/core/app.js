import 'lazysizes';

import moment from 'moment';
import extend from 'xtend';

import TheatricsAPI from './api';
import Resolver from './resolver';
import Locations from './locations';
import Router from './router';
import * as handlers from './handlers';

import Settings from '../models/settings';

import MainView from '../views/main';

import {
  loader,
  bigLoader,
  capfirst,
  isiOS,
  getMapURL,
  restrictBreaks,
  niceURL,
  displayDuration
} from '../utils';


export default class App {
  constructor() {
    this.api = new TheatricsAPI();
    this.settings = new Settings();
    this.locations = new Locations();

    this.resolver = new Resolver();
    this.resolver.addRoute('index', '/');
    this.resolver.addRoute('location', '/{location:[a-z\-]+}/');
    this.resolver.addRoute('event-list', '/{location:[a-z\-]+}/events/');
    this.resolver.addRoute(
      'event-list',
      '/{location:[a-z\-]+}/events/{date:\\d\\d\\d\\d-\\d\\d-\\d\\d}/');
    this.resolver.addRoute('place-list', '/{location:[a-z\-]+}/places/');
    this.resolver.addRoute('event', '/event/{id:\\d+}/');
    this.resolver.addRoute('place', '/place/{id:\\d+}/');

    this.router = new Router(this);
    this.router.addHandler('index', handlers.index);
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
      restrictBreaks,
      niceURL,
      displayDuration,
      url: (...args) => this.resolver.reverse(...args),
      app: this,
    }

    this.mainView = new MainView({app: this});
  }

  run() {
    this.mainView.mount(document.documentElement);
    this.router.redirect(window.location.pathname);
  }

  renderTemplate(template, context={}) {
    return template(extend(this.templateContext, context));
  }
}
