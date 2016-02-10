import 'lazysizes';

import TheatricsAPI from './api';
import Resolver from './resolver';
import Locations from './locations';
import Router from './router';

import Settings from '../models/settings';

import MainView from '../views/main';
import LocationChooser from '../views/location-chooser';
import NotFoundView from '../views/not-found';

import EventPageView from '../pages/event';
import EventListPageView from '../pages/event-list';
import PlacePageView from '../pages/place';
import PlaceListPageView from '../pages/place-list';

import {show, hide} from '../utils';


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

    this.router = new Router(this.resolver);
    this.router.addHandler('index', this.visitIndex.bind(this));
    this.router.addHandler('location', this.visitLocation.bind(this));
    this.router.addHandler('event-list', this.visitEventList.bind(this));
    this.router.addHandler('place-list', this.visitPlaceList.bind(this));
    this.router.addHandler('event', this.visitEvent.bind(this));
    this.router.addHandler('place', this.visitPlace.bind(this));
    this.router.setNotFoundHandler(this.notFound.bind(this));

    const viewContainer = document.querySelector('#view-container');
    this.mainView = new MainView({app: this});
    this.mainView.mount(viewContainer);
  }

  run() {
    this.settings.fetch().then(() => {
      this.setupLocationChooser();
      this.router.redirect(window.location.pathname);
    });
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser({app: this});
    locationContainer.appendChild(locationChooser.render());
    show(locationContainer);
  }

  setTitle(title) {
    this.mainView.setTitle(title);
  }

  // route handlers

  visitIndex() {
    const location = this.settings.get('location');
    const path = this.resolver.reverse('event-list', {location});
    this.router.redirect(path);
  }

  visitLocation({location}) {
    const path = this.resolver.reverse('event-list', {location});
    this.router.redirect(path);
  }

  visitEventList(args) {
    this.mainView.switchView(EventListPageView, args);
  }

  visitPlaceList(args) {
    this.mainView.switchView(PlaceListPageView, args);
  }

  visitEvent(args) {
    this.mainView.switchView(EventPageView, args);
  }

  visitPlace(args) {
    this.mainView.switchView(PlacePageView, args);
  }

  notFound() {
    this.mainView.switchView(NotFoundView);
  }
}
