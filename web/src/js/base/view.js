import domify from 'domify';
import Events from 'events-mixin';

import {clear, replace} from '../utils/elements';


export default class View {
  constructor({app}) {
    this.app = app;
  }

  static render(args, container) {
    if (container.__view instanceof this) {
      container.__view.update(args);
    } else {
      const view = new this(args);
      const element = view.render();
      clear(container)
      container.appendChild(element);
      container.__view = view;
    }
    return container.__view;
  }

  render() {
    const html = this.getHTML();
    const element = domify(html);
    this.attach(element);
    return element;
  }

  attach(element) {
    if (this.isAttached) throw new Error("Cannot attach attached view.");
    this.element = element;
    this.events = new Events(element, this);
    this.mount();
    this.isAttached = true;
  }

  update(args) {
    if (!this.isAttached) throw new Error("Cannot update unattached view.");
    this.constructor(args);
    this.sync();
  }

  detach() {
    if (!this.isAttached) throw new Error("Cannot detach unattached view.");
    this.isAttached = false;
    this.unmount();
    this.events.unbindAll();
    this.element = null;
  }

  getHTML() {
    return '<div></div>';
  }

  mount() {}

  sync() {
    const oldElement = this.element;
    this.detach();
    const newElement = this.render();
    replace(oldElement, newElement);
  }

  unmount() {}
}
