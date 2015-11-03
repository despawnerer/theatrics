import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Resolver from './resolver';
import Locations from './locations';
import Router from './router';
import ViewSwitcher from './view-switcher';

import Settings from '../models/settings';

import LocationChooser from '../views/location-chooser';
import EventsView from '../views/events-view';
import PlacesView from '../views/places-view';
import SingleEventView from '../views/single-event-view';

import {show, hide} from '../utils';


export default class App {
  constructor() {
    this.settings = new Settings();
    this.settings.on('change', this.onSettingsChange.bind(this));

    this.locations = new Locations();

    this.resolver = new Resolver();
    this.resolver.addRoute('index', '/');
    this.resolver.addRoute('location', '/{location:[a-z\-]+}/');
    this.resolver.addRoute('events', '/{location:[a-z\-]+}/events/');
    this.resolver.addRoute(
      'events',
      '/{location:[a-z\-]+}/events/{date:\\d\\d\\d\\d-\\d\\d-\\d\\d}/');
    this.resolver.addRoute('places', '/{location:[a-z\-]+}/places/');
    this.resolver.addRoute('single-event', '/event/{id:\\d+}/');

    this.router = new Router(this.resolver);
    this.router.addHandler('index', this.visitIndex.bind(this));
    this.router.addHandler('location', this.visitLocation.bind(this));
    this.router.addHandler('events', this.visitEvents.bind(this));
    this.router.addHandler('places', this.visitPlaces.bind(this));
    this.router.addHandler('single-event', this.visitSingleEvent.bind(this));

    const viewContainer = document.querySelector('#view-container')
    this.viewSwitcher = new ViewSwitcher(this, viewContainer);
  }

  run() {
    Promise.all([
      this.locations.fetch(),
      this.settings.fetch(),
    ]).then(() => {
      this.setupLocationChooser();
      this.router.redirect(window.location.pathname);
    });
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser({app: this});
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  }

  setTitle(title) {
    const fullTitle = `${title} – Theatrics`;
    document.title = fullTitle;
    history.replaceState(
      history.state,
      fullTitle,
      window.location.pathname
    );
  }

  // route handlers

  visitIndex() {
    const location = this.settings.get('location');
    const path = this.resolver.reverse('events', {location});
    this.router.redirect(path);
  }

  visitLocation({location}) {
    const path = this.resolver.reverse('events', {location});
    this.router.redirect(path);
  }

  visitEvents(args) {
    this.viewSwitcher.switchView(EventsView, args);
  }

  visitPlaces(args) {
    this.viewSwitcher.switchView(PlacesView, args);
  }

  visitSingleEvent(args) {
    this.viewSwitcher.switchView(SingleEventView, args);
  }

  // event handlers

  onSettingsChange() {
    if (this.settings.hasChanged('location')) {
      this.handleLocationChange(this.settings.get('location'));
    }
  }

  handleLocationChange(location) {
    const view = this.currentView instanceof PlacesView ? 'places' : 'events';
    const args = {location};
    const path = this.resolver.reverse(view, args)
    this.router.navigate(path);
  }
}
