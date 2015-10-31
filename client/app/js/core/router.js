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

  navigate(path) {
    const {name, args} = this.resolver.resolve(path);
    history.pushState({name, args}, null, path);
    this.callHandler(name, args);
  }

  redirect(path) {
    const {name, args} = this.resolver.resolve(path);
    history.replaceState({name, args}, null, path);
    this.callHandler(name, args);
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
    if (!event.state) {
      // this is a fake pop state event so don't handle it
      return;
    }
    const {name, args} = this.resolver.resolve(window.location.path);
    this.callHandler(name, args);
  }

  callHandler(name, args) {
    this.handlers[name].call(this, args);
  }
}
