import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Events from 'events-mixin';

import Locations from './locations';
import Settings from './settings';
import Router from './router';

import LocationChooser from './location-chooser';
import EventsView from './events';
import PlacesView from './places';

import {show, hide} from './utils';


export default class App {
  constructor() {
    this.settings = new Settings();
    this.settings.on('change', this.onSettingChange.bind(this));

    this.locations = new Locations();

    this.router = new Router(this);
    this.router.addRoute('/', 'visitIndex');
    this.router.addRoute('/{location:[a-z\-]+}/', 'visitLocation');
    this.router.addRoute('/{location:[a-z\-]+}/events/', 'visitEvents');
    this.router.addRoute(
      '/{location:[a-z\-]+}/events/{date:\\d\\d\\d\\d-\\d\\d-\\d\\d}/',
      'visitEvents');
    this.router.addRoute('/{location:[a-z\-]+}/places/', 'visitPlaces');

    this.events = new Events(document, this);
    this.events.bind('click a', 'onAnchorClick');

    this.currentView = null;
    this.viewContainer = document.querySelector('#view-container');
  }

  run() {
    Promise.all([
      this.locations.fetch(),
      this.settings.fetch(),
    ]).then(() => {
      this.setupLocationChooser();
      this.router.start();
    });
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser(this.locations, this.settings);
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  }

  // route handling

  visitIndex() {
    const location = this.settings.get('location');
    this.navigateToEvents(location, false);
  }

  visitLocation(location) {
    this.settings.set('location', location);
    this.navigateToEvents(location, false);
  }

  visitEvents(location, date) {
    if (!(this.currentView instanceof EventsView)) {
      const events = new EventsView();
      this.switchView(events);
    }
    this.currentView.visit(location, date);
  }

  visitPlaces(location) {
    if (!(this.currentView instanceof PlacesView)) {
      const places = new PlacesView();
      this.switchView(places);
    }
    this.currentView.visit(location);
  }

  switchView(view) {
    view.render();
    this.viewContainer.innerHTML = '';
    this.viewContainer.appendChild(view.element);
    this.currentView = view;
  }

  // event handlers

  onAnchorClick(event) {
    const element = event.target;
    if (element.origin !== window.location.origin) {
      return;
    }
    event.preventDefault();
    this.router.navigate(element.pathname);
  }

  onSettingChange(key, value) {
    if (key === 'location') {
      this.handleLocationChange(value);
    }
  }

  handleLocationChange(location) {
    if (this.currentView instanceof EventsView) {
      this.navigateToEvents(location);
    } else if (this.currentView instanceof PlacesView) {
      this.navigateToPlaces(location);
    } else {
      this.navigateToEvents(location);
    }
  }

  // useful navigation shortcuts

  navigateToEvents(location, saveToHistory=true) {
    this.router.navigate(`/${location}/events/`, saveToHistory);
  }

  navigateToPlaces(location, saveToHistory=true) {
    this.router.navigate(`/${location}/places/`, saveToHistory);
  }
}
