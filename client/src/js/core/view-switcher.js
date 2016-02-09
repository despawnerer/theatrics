import extend from 'xtend';

import Cache from './cache';
import Model from '../base/model';
import {show, hide} from '../utils';


export default class ViewSwitcher {
  constructor(app, element) {
    this.app = app;
    this.element = element;

    this.state = {
      view: null,
      element: null,
      title: document.title,
    }

    this.cache = new Cache(5);
  }

  switchView(ViewClass, args={}) {
    if (this.state.element) {
      this.element.removeChild(this.state.element);
    }

    const cacheKey = [ViewClass, args];
    const cachedState = this.cache.get(cacheKey);
    if (this.state.view instanceof ViewClass) {
      this.state.view.model.replace(args);
    } else if (cachedState) {
      this.state = cachedState;
      this.state.view.model.replace(args);
    } else {
      this.state = this.buildNewState(ViewClass, args);
    }

    this.element.appendChild(this.state.element);
    document.title = this.state.title;
    this.cache.put(cacheKey, this.state);
  }

  setTitle(title) {
    const fullTitle = `${title} – Theatrics`;
    this.state.title = fullTitle;
    document.title = fullTitle;
    history.replaceState(
      history.state,
      fullTitle,
      window.location.pathname
    );
  }

  buildNewState(ViewClass, args) {
    const model = new Model(args);
    const view = new ViewClass({app: this.app, model: model});
    return {
      view: view,
      element: view.render(),
      title: null
    };
  }
}
