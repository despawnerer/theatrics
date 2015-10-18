import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Events from 'events-mixin';

import Locations from './locations';
import Settings from './settings';
import Router from './router';

import LocationChooser from './location-chooser';
import EventsView from './events';

import {show, hide} from './utils';


export default class App {
  constructor() {
    this.settings = new Settings();
    this.settings.on('change', this.onSettingChange.bind(this));

    this.locations = new Locations();

    this.router = new Router(this);
    this.router.addRoute('/', 'visitIndex');
    this.router.addRoute('/index.html', 'visitIndex');
    this.router.addRoute('/{location:.+}/events/', 'visitEvents');
    this.router.addRoute(
      '/{location:.+}/events/{date:\\d\\d\\d\\d-\\d\\d-\\d\\d}/',
      'visitEvents');

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

  visitIndex() {
    const location = this.settings.get('location');
    this.router.navigate(`/${location}/events/`);
  }

  visitEvents(location, date) {
    if (!(this.currentView instanceof EventsView)) {
      const events = new EventsView();
      this.switchView(events);
    }
    this.currentView.visit(location, date);
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser(this.locations, this.settings);
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  }

  switchView(view) {
    view.render();
    this.viewContainer.innerHTML = '';
    this.viewContainer.appendChild(view.element);
    this.currentView = view;
  }

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
      this.currentView.visit(location);
    } else {
      this.visitEvents(location);
    }
  }
}
