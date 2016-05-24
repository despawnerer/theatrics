import Events from 'events-mixin';
import isPromise from 'is-promise';

import MainView from '../views/main';
import {forceScroll, uuid, getURL, merge} from '../utils';

import Cache from './cache';
import Response from './response';
import locations from './locations';


export default class Navigator {
  constructor(app) {
    this.app = app;
    this.stateController = new StateController(app);

    this.events = new Events(document, this);
    this.events.bind('click a', 'onAnchorClick');
    window.addEventListener('navigate', event => this.onWindowNavigate(event));
    window.addEventListener('popstate', event => this.onWindowPopState(event));
  }

  start() {
    this.navigate(getURL(window.location));
  }

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
    this.navigate(getURL(element));
  }

  onWindowNavigate(event) {
    this.navigate(event.detail);
  }

  onWindowPopState(event) {
    if (event.state === null) {
      // this is a fake pop state event so don't handle it
      return;
    } else {
      this.stateController.restore(event.state, getURL(window.location));
    }
  }

  navigate(url) {
    this.stateController.push(url).then(state => forceScroll(0, 0));
  }
}


class StateController {
  constructor(app) {
    this.app = app;
    this.cache = new Cache(5);
    this.state = new State({
      location: locations.get('spb')
    });
  }

  push(url) {
    return this.load(url, true);
  }

  redirect(url) {
    return this.load(url);
  }

  restore(stateId, url) {
    const cachedState = this.cache.get(stateId);
    if (cachedState) {
      this.switch(cachedState, {cache: true});
    } else {
      this.load(url);
    }
  }

  load(url, push=false) {
    const route = this.app.resolver.resolve(url);
    const handler = this.app.router.getHandler(route.name);
    const response = handler(this.app, this.state, route.args);
    const isWaiting = isPromise(response);
    this.update({isWaiting, route, url}, {push});
    return Promise.resolve(response)
      .then(response => this.applyResponse(response));
  }

  applyResponse(response) {
    switch (response.type) {
      case Response.Redirect:
        return this.redirect(response.value);
      case Response.Render:
      case Response.NotFound:
        return this.render(response.value);
      default:
        throw new Error("Unexpected response from handler");
    }
  }

  render(data) {
    data.element = this.renderPage(data.page);
    data.isWaiting = false;
    return this.update(data, {cache: true});
  }

  update(data, {cache=false, push=false}={}) {
    return this.switch(this.state.update(data), {cache, push});
  }

  switch(state, {cache=false, push=false}={}) {
    const view = new MainView({app: this.app, state});
    view.mount(document.documentElement);

    if (cache) {
      this.cache.put(state.id, state);
    }

    if (push) {
      history.pushState(state.id, document.title, state.url);
    } else {
      history.replaceState(state.id, document.title, state.url);
    }

    this.state = state;
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
}


class State {
  constructor(data) {
    this.id = uuid();
    Object.assign(this, data);
    return Object.freeze(this);
  }

  update(data) {
    data = merge(this, data);
    delete data.id;
    return new State(data);
  }
}
