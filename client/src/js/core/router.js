import Events from 'events-mixin';
import isString from 'is-string';

import Cache from './cache';

import {forceScroll} from '../utils';


export default class Router {
  constructor(app) {
    this.app = app;

    this.cache = new Cache(5);
    this.handlers = {};

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
      this.returnTo(window.location.pathname);
    }
  }

  /* Three different types of navigation */

  navigate(path) {
    const route = this.app.resolver.resolve(path);
    history.pushState(route, null, path);
    this.handleRoute(route).then(() => forceScroll(0, 0));
  }

  redirect(path) {
    const route = this.app.resolver.resolve(path);
    history.replaceState(route, null, path);
    this.handleRoute(route);
  }

  returnTo(path) {
    const route = this.app.resolver.resolve(path);
    const cachedState = this.cache.get(route);
    if (cachedState) {
      this.app.mainView.setState(cachedState);
    } else {
      this.handleRoute(route);
    }
  }

  /* Switching pages */

  handleRoute(route) {
    const handler = this.getHandler(route.name);
    const response = handler(this.app, route.args);
    if (response instanceof Promise) {
      this.app.mainView.wait();
      return response.then(response => this.applyResponse(route, response));
    } else {
      this.applyResponse(route, response);
      return new Promise;
    }
  }

  applyResponse(route, response) {
    if (isString(response)) {
      this.redirect(response);
    } else {
      this.switchPage(route, response);
    }
  }

  switchPage(route, page) {
    const currentState = this.app.mainView.state;
    this.cache.put(currentState.route, currentState);

    const newState = {
      page,
      route,
      title: page.getTitle(),
      element: this.getNewElement(page, currentState),
    };
    this.app.mainView.setState(newState);
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
}
