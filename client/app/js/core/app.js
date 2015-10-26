import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Events from 'events-mixin';

import Resolver from './resolver';
import Locations from './locations';

import Settings from '../models/settings';

import Model from '../base/model';

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

    this.events = new Events(document, this);
    this.events.bind('click a', 'onAnchorClick');
    window.addEventListener('popstate', this.onWindowPopState.bind(this));

    this.viewContainer = document.querySelector('#view-container');
  }

  run() {
    Promise.all([
      this.locations.fetch(),
      this.settings.fetch(),
    ]).then(() => {
      this.setupLocationChooser();
      this.redirect(window.location.pathname);
    });
  }

  setupLocationChooser() {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser({app: this});
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  }

  // event handlers

  onAnchorClick(event) {
    const element = event.delegateTarget;
    if (element.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    this.goTo(element.pathname);
  }

  onWindowPopState(event) {
    if (!event.state) {
      // this is a fake pop state event
      return;
    }
    this.switchView(event.state.name, event.state.args);
  }

  onSettingsChange() {
    if (this.settings.hasChanged('location')) {
      this.handleLocationChange(this.settings.get('location'));
    }
  }

  handleLocationChange(location) {
    const view = this.currentView instanceof PlacesView ? 'places' : 'events';
    const args = {location};
    this.goTo(this.resolver.reverse(view, args));
  }

  // navigation

  goTo(path) {
    const {name, args} = this.resolver.resolve(path);
    history.pushState({name, args}, null, path);
    this.switchView(name, args);
  }

  redirect(path) {
    const {name, args} = this.resolver.resolve(path);
    history.replaceState({name, args}, null, path);
    this.switchView(name, args);
  }

  // view switching

  switchView(name, args) {
    const redirectPath = this.getRedirectByName(name);
    if (redirectPath) {
      this.redirect(redirectPath);
      return;
    }

    const ViewClass = this.selectViewByName(name);
    if (this.currentView instanceof ViewClass) {
      this.currentView.model.replace(args);
      return;
    }

    if (this.currentView) {
      this.currentView.unbind();
    }

    const model = new Model(args);
    const view = new ViewClass({app: this, model: model});
    this.viewContainer.innerHTML = '';
    this.viewContainer.appendChild(view.element)
    view.render();

    this.currentView = view;
  }

  getRedirectByName(name) {
    const location = this.settings.get('location');
    switch (name) {
      case 'index':
        return this.resolver.reverse('events', {location});
      case 'location':
        return this.resolver.reverse('events', {location});
      default:
        return null;
    }
  }

  selectViewByName(name) {
    switch (name) {
      case 'events':
        return EventsView;
      case 'places':
        return PlacesView;
      case 'single-event':
        return SingleEventView;
      default:
        return null;
    }
  }
}
