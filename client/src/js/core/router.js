import Events from 'events-mixin';
import extend from 'xtend';
import isPromise from 'is-promise';

import {forceScroll, uuid} from '../utils';

import Cache from './cache';
import Response from './response';


export default class Router {
  constructor(app) {
    this.app = app;

    this.handlers = {};

    this.cache = new Cache(5);
    this.state = {};

    this.events = new Events(document, this);
    this.events.bind('click a', 'onAnchorClick');
    window.addEventListener('popstate', this.onWindowPopState.bind(this));
  }

  /* Handler management */

  addHandler(name, handler) {
    this.handlers[name] = handler;
  }

  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }

  getHandler(name) {
    if (!name || !(name in this.handlers)) {
      return this.notFoundHandler;
    } else {
      return this.handlers[name];
    }
  }

  /* Events */

  onAnchorClick(event) {
    const isLeftClick = event.button == 0;
    const isModified = event.ctrlKey || event.shiftKey || event.metaKey;
    if (!isLeftClick || isModified) {
      return;
    }

    const element = event.delegateTarget;
    if (element.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    this.navigate(element.pathname);
  }

  onWindowPopState(event) {
    if (event.state === null) {
      // this is a fake pop state event so don't handle it
      return;
    } else {
      this.restoreSavedState(event.state);
    }
  }

  /* Navigation */

  navigate(path) {
    const state = this.buildStateFromPath(path);
    history.pushState(state, null, path);
    return this.loadNewState(state).then(state => forceScroll(0, 0));
  }

  redirect(path) {
    const state = this.buildStateFromPath(path);
    history.replaceState(state, null, path);
    return this.loadNewState(state);
  }

  /* States */

  restoreSavedState(savedState) {
    const cachedState = this.cache.get(savedState.id);
    if (cachedState) {
      this.switchToState(cachedState);
    } else {
      this.loadNewState(savedState);
    }
  }

  loadNewState(state) {
    const handler = this.getHandler(state.route.name);
    const response = handler(this.app, state.route.args);
    // This isn't written in a more generic way because for some reason
    // doing rendering from within a Promise callback causes flickering
    // in Safari, and I don't like it. So we're stuck with this mess
    // until the issue is fixed or I stop caring.
    if (isPromise(response)) {
      this.app.mainView.wait();
      return response.then(response => this.applyResponse(state, response));
    } else {
      return Promise.resolve(this.applyResponse(state, response));
    }
  }

  applyResponse(state, response) {
    switch (response.type) {
      case Response.Redirect:
        return this.redirect(response.value);
      case Response.Render:
      case Response.NotFound:
        return this.renderState(extend(state, response.value));
      default:
        throw new Error("Unexpected response from handler");
    }
  }

  renderState(state) {
    state.element = this.renderPage(state.page);
    this.switchToState(state);
    return state;
  }

  renderPage(page) {
    if (page.canTransitionFrom(this.state.page)) {
      const element = this.state.element.cloneNode(true);
      page.mount(element, true);
      return element;
    } else {
      return page.render();
    }
  }

  switchToState(state) {
    this.state = state;
    this.cache.put(state.id, state);
    history.replaceState(
      this.getSaveableState(), document.title, window.location.pathname);
    this.app.settings.set('location', state.page.getLocation());
    this.app.mainView.setState(state);
  }

  getSaveableState() {
    return {
      id: this.state.id,
      route: this.state.route,
    }
  }

  buildStateFromPath(path) {
    return {
      id: uuid(),
      route: this.app.resolver.resolve(path),
    }
  }
}
