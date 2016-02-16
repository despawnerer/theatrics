import Events from 'events-mixin';
import isString from 'is-string';
import isPromise from 'is-promise';
import extend from 'xtend';

import Cache from './cache';


export default class Router {
  constructor(app) {
    this.app = app;

    this.handlers = {};

    this.cache = new Cache(5);
    this.lastStateId = 0;

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
      this.returnTo(event.state);
    }
  }

  /* Navigation */

  navigate(path) {
    this.updatedSavedState();

    const state = this.buildNewState(path);
    history.pushState(state, null, path);
    this.loadNewState(state);
  }

  redirect(path) {
    const state = this.buildNewState(path);
    history.replaceState(state, null, path);
    this.loadNewState(state);
  }

  /* Switching states */

  returnTo(savedState) {
    const cachedState = this.cache.get(savedState.id);
    if (cachedState) {
      this.setState(cachedState);
    } else {
      this.loadNewState(savedState);
    }
  }

  loadNewState(state) {
    const handler = this.getHandler(state.route.name);
    const response = handler(this.app, state.route.args);
    if (isPromise(response)) {
      this.app.mainView.wait();
      response.then(response => this.applyResponse(state, response));
    } else {
      this.applyResponse(state, response);
    }
  }

  applyResponse(state, response) {
    if (isString(response)) {
      this.redirect(response);
    } else {
      this.switchPage(state, response);
    }
  }

  switchPage(state, page) {
    const currentState = this.getState();
    const newState = extend(state, {
      page: page,
      title: page.getTitle(),
      element: this.getNewElement(page, currentState),
    });
    this.setState(newState);
  }

  getNewElement(page, previousState) {
    if (this.canPageBeDynamicallySwitched(page, previousState.page)) {
      const element = previousState.element.cloneNode(true);
      page.mount(element, true);
      return element;
    } else {
      return page.render();
    }
  }

  canPageBeDynamicallySwitched(page, previousPage) {
    return (
      page && previousPage &&
      page instanceof previousPage.constructor
      && page.isDynamic()
    );
  }

  /* States */

  updatedSavedState() {
    const state = this.getState();
    const saveableState = this.extractSaveableState(state);
    history.replaceState(saveableState, document.title, state.path);
    this.cache.put(state.id, state);
  }

  buildNewState(path) {
    return {
      id: this.lastStateId++,
      path: path,
      route: this.app.resolver.resolve(path),
      title: null,
      scrollX: 0,
      scrollY: 0,
    }
  }

  extractSaveableState(state) {
    return {
      id: state.id,
      path: state.path,
      route: state.route,
      title: state.title,
      scrollX: state.scrollX,
      scrollY: state.scrollY,
    }
  }

  setState(state) {
    this.app.mainView.setState(state);
  }

  getState() {
    return this.app.mainView.getState();
  }
}
