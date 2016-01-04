import extend from 'xtend';

import Cache from './cache';
import Model from '../base/model';
import {show, hide} from '../utils';


export default class ViewSwitcher {
  constructor(app, element) {
    this.app = app;
    this.element = element;

    this.currentView = null;
    this.cache = new Cache(5);
  }

  switchView(constructor, args={}) {
    if (this.currentView) {
      this.element.removeChild(this.currentView.element);
    }

    const cacheKey = [constructor, args];
    const cachedState = this.cache.get(cacheKey);
    let newState;
    if (this.currentView instanceof constructor) {
      newState = this.getState();
      this.currentView.model.replace(args);
    } else if (cachedState) {
      newState = cachedState;
      newState.view.model.replace(args);
    } else {
      newState = this.getState();
      newState.view = this.buildView(constructor, args);
      newState.view.render();
    }

    this.applyState(newState);
    this.cache.put(cacheKey, newState);
  }

  setTitle(title) {
    const fullTitle = `${title} – Theatrics`;
    document.title = fullTitle;
    history.replaceState(
      history.state,
      fullTitle,
      window.location.pathname
    );
  }

  applyState(state) {
    this.currentView = state.view;
    this.element.appendChild(state.view.element);
    document.title = state.title;
  }

  getState() {
    return {
      view: this.currentView,
      title: document.title,
    }
  }

  buildView(constructor, args) {
    const model = new Model(args);
    return new constructor({app: this.app, model: model});
  }
}
