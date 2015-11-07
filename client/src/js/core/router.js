import Events from 'events-mixin';


export default class Router {
  constructor(resolver) {
    this.resolver = resolver;

    this.handlers = {};

    this.events = new Events(document, this);
    this.events.bind('click a', 'onAnchorClick');
    window.addEventListener('popstate', this.onWindowPopState.bind(this));
  }

  addHandler(name, handler) {
    this.handlers[name] = handler;
  }

  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }

  navigate(path) {
    const state = this.handlePath(path);
    history.pushState(state, null, path);
  }

  redirect(path) {
    const state = this.handlePath(path);
    history.replaceState(state, null, path);
  }

  onAnchorClick(event) {
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
      this.handlePath(window.location.pathname);
    }
  }

  handlePath(path) {
    const state = this.resolver.resolve(path);
    if (state === null) {
      this.notFoundHandler.call(this);
    } else {
      const {name, args} = state;
      this.handlers[name].call(this, args);
    }
    return state;
  }
}
