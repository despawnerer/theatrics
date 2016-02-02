import {regexpEscape, zipIntoObject} from './utils';


export default class Resolver {
  constructor() {
    this.routes = [];
  }

  addRoute(name, pathSpec) {
    const expressionParts = [];
    const argNames = []
    const namedVarExpr = this._getNamedVarExpression();
    let previousLastIndex = 0;
    let match;
    while ((match = namedVarExpr.exec(pathSpec)) !== null) {
      const [foundText, argName, varExpression] = match;
      const firstIndex = namedVarExpr.lastIndex - foundText.length;
      const textBefore = pathSpec.slice(previousLastIndex, firstIndex);
      previousLastIndex = namedVarExpr.lastIndex;
      expressionParts.push(regexpEscape(textBefore));
      expressionParts.push(`(${varExpression})`);
      argNames.push(argName);
    }
    const leftovers = pathSpec.slice(previousLastIndex);
    expressionParts.push(regexpEscape(leftovers));

    const expressionString = expressionParts.join('');
    const expression = new RegExp(`^${expressionString}$`);
    this.routes.push({name, argNames, expression, pathSpec});
  }

  resolve(path) {
    for (let route of this.routes) {
      const {name, argNames, expression} = route;
      const match = path.match(expression);
      if (match === null) {
        continue;
      }

      const argValues = match.slice(1);
      const args = zipIntoObject(argNames, argValues);
      return {name, args};
    }

    return undefined;
  }

  reverse(name, args) {
    const argNames = Object.keys(args);

    for (let route of this.routes) {
      const nameMatches = route.name === name;
      const argsMatch = argNames.every(x => route.argNames.indexOf(x) > -1);
      if (!nameMatches || !argsMatch) {
        continue;
      }

      let path = route.pathSpec;
      argNames.forEach(name => {
        const expression = this._getNamedVarExpression(name);
        const value = args[name];
        path = path.replace(expression, value);
      });
      return path;
    }

    return undefined;
  }

  _getNamedVarExpression(name) {
    if (!name) {
      return /\{([a-zA-Z]+?)\:(.+?)\}/g;
    } else {
      return new RegExp(`\{(${regexpEscape(name)})\:(.+?)\}`);
    }
  }
}