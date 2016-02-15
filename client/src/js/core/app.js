import 'lazysizes';

import TheatricsAPI from './api';
import Resolver from './resolver';
import Locations from './locations';
import Router from './router';
import * as handlers from './handlers';

import Settings from '../models/settings';

import MainView from '../views/main';
import LocationChooser from '../views/location-chooser';


import {show} from '../utils';


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

    const viewContainer = document.querySelector('#view-container');
    this.mainView = new MainView({app: this});
    this.mainView.mount(viewContainer);
  }

  run() {
    this.setupLocationChooser();
    this.router.redirect(window.location.pathname);
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser({app: this});
    locationContainer.appendChild(locationChooser.render());
    show(locationContainer);
  }
}
