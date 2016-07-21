import domify from 'domify';


export default class View {
  constructor({app}) {
    this.app = app;
  }

  render() {
    const html = this.getHTML();
    const element = domify(html);
    this.mount(element);
    return element;
  }

  renderInto(target) {
    target.innerHTML = this.getHTML();
    const element = target.children[0];
    this.mount(element);
    return element;
  }

  getHTML() {
    return '<div></div>';
  }

  mount(element, sync=false) {
    this.element = element;
  }
}