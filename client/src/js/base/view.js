import domify from 'domify';


export default class View {
  constructor({app, model}) {
    this.app = app;
    this.model = model;
  }

  render() {
    const html = this.getHTML();
    const element = domify(html);
    this.mount(element);
    return element;
  }

  getHTML() {
    return '<div></div>';
  }

  mount(element) {
    this.element = element;
    if (this.model) {
      this.model.on('change', () => this.onModelChange());
    }
  }

  onModelChange() {}
}