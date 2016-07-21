import domify from 'domify';
import Events from 'events-mixin';


export default class View {
  constructor({app}) {
    this.app = app;
  }

  render() {
    const html = this.getHTML();
    const element = domify(html);
    this.attach(element);
    return element;
  }

  renderInto(target) {
    target.innerHTML = this.getHTML();
    const element = target.children[0];
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
