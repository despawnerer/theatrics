import Cache from './cache';
import Model from '../base/model';
import {show, hide} from '../utils';


export default class ViewSwitcher {
  constructor(app, element) {
    this.app = app;
    this.element = element;

    this.currentView = null;

    this.cache = new Cache(5);
    this.cache.on('remove', this.onRemove.bind(this));
  }

  switchView(ViewClass, args={}) {
    if (this.currentView instanceof ViewClass) {
      this.currentView.model.replace(args);
      return;
    }

    if (this.currentView) {
      this.element.removeChild(this.currentView.element);
    }

    const cacheKey = [ViewClass, args];
    const view = this.cache.get(cacheKey) || this.buildView(ViewClass, args);
    view.render();
    this.element.appendChild(view.element);
    this.currentView = view;
    this.cache.put(cacheKey, view);
  }

  buildView(ViewClass, args) {
    const model = new Model(args);
    return new ViewClass({app: this.app, model: model});
  }

  onRemove(key, view) {
    view.unbind();
  }
}
