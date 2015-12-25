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
    const state = this.resolver.resolve(path);
    history.pushState(state, null, path);
    this.handleState(state);
  }

  redirect(path) {
    const state = this.resolver.resolve(path);
    history.replaceState(state, null, path);
    this.handleState(state);
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
    this.navigate(element.pathname);
  }

  onWindowPopState(event) {
    if (event.state === null) {
      // this is a fake pop state event so don't handle it
      return;
    } else {
      const state = this.resolver.resolve(window.location.pathname);
      this.handleState(state);
    }
  }

  handleState(state) {
    if (state === null) {
      this.notFoundHandler.call(this);
    } else {
      const {name, args} = state;
      this.handlers[name].call(this, args);
    }
  }
}
