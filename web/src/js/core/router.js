export default class Router {
  constructor() {
    this.handlers = {};
  }

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
}
