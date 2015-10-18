import {regexpEscape} from './utils';


export default class Router {
  constructor(target) {
    this.target = target;
    this.routes = [];
  }

  addRoute(pathSpec, handler) {
    const expressionParts = [];
    const namedVarExpr = /\{([a-zA-Z]+?)\:(.+?)\}/g;
    let previousLastIndex = 0;
    let match;
    while ((match = namedVarExpr.exec(pathSpec)) !== null) {
      let [foundText, varName, varExpression] = match;
      let firstIndex = namedVarExpr.lastIndex - foundText.length;
      let textBefore = pathSpec.slice(previousLastIndex, firstIndex);
      previousLastIndex = namedVarExpr.lastIndex;
      expressionParts.push(regexpEscape(textBefore));
      expressionParts.push(`(${varExpression})`);
    }
    const leftovers = pathSpec.slice(previousLastIndex);
    expressionParts.push(regexpEscape(leftovers));

    const expressionString = expressionParts.join('');
    const expression = new RegExp(`^${expressionString}$`);
    this.routes.push([expression, handler]);
  }

  start() {
    window.addEventListener('popstate', this.onWindowPopState.bind(this));
    this.callHandlerForCurrentLocation();
  }

  onWindowPopState(event) {
    this.callHandlerForCurrentLocation();
  }

  navigate(path, saveToHistory=true) {
    const [handler, args] = this.resolve(path);
    if (saveToHistory) {
      history.pushState({handler, args}, handler, path);
    } else {
      history.replaceState({handler, args}, handler, path);
    }
    this.callHandler(handler, args);
  }

  callHandlerForCurrentLocation() {
    const path = window.location.pathname;
    const [handler, args] = this.resolve(path);
    this.callHandler(handler, args);
  }

  callHandler(handler, args) {
    this.target[handler].apply(this.target, args);
  }

  resolve(path) {
    for (let route of this.routes) {
      let [expression, handler] = route;
      let match = path.match(expression);
      if (match === null) {
        continue;
      }

      let args = match.slice(1);
      return [handler, args];
    }
  }
}
