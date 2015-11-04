import Model from '../base/model';


export default class ViewSwitcher {
  constructor(app, element) {
    this.app = app;
    this.element = element;

    this.currentView = null;
  }

  switchView(ViewClass, args) {
    if (this.currentView instanceof ViewClass) {
      this.currentView.model.replace(args);
      return;
    }

    if (this.currentView) {
      this.currentView.unbind();
      this.element.removeChild(this.currentView.element);
    }

    const model = new Model(args);
    const view = new ViewClass({app: this.app, model: model});
    view.render();

    this.element.appendChild(view.element);

    this.currentView = view;
  }
}
