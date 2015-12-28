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
      title: document.title,
    }

    this.cache = new Cache(5);
    this.cache.on('remove', this.onStateCacheRemove.bind(this));
  }

  switchView(ViewClass, args={}) {
    const currentState = this.state;
    const currentView = currentState.view;

    if (currentView instanceof ViewClass) {
      currentView.model.update(args);
      return;
    }

    if (currentView) {
      this.element.removeChild(currentView.element);
    }

    const cacheKey = [ViewClass, args];
    const cachedState = this.cache.get(cacheKey);
    const newState = cachedState || this.buildNewState(ViewClass, args)
    this.state = newState;

    this.element.appendChild(newState.view.element);
    if (cachedState) {
      newState.view.model.update(args);
    } else {
      newState.view.render();
    }

    this.cache.put(cacheKey, newState);
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
    return {view: view, title: document.title};
  }

  onStateCacheRemove(key, state) {
    state.view.unbind();
  }
}
