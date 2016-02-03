import domify from 'domify';


export default class View {
  constructor(context) {
    this.context = context;
  }

  render() {
    const html = this.getHTML();
    const element = domify(html);
    this.mount(element);
    return this;
  }

  getHTML() {
    throw new Error("Views must define getHTML()")
  }

  mount(element) {
    this.element = element;
  }
}
