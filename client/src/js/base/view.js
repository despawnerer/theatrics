export default class View {
  constructor({app, model}) {
    this.app = app;
    this.model = model;
  }

  render() {
    const element = this.createElement();
    element.innerHTML = this.renderInnerHTML();
    this.mount(element);
    return element;
  }

  renderInnerHTML() {
    return '';
  }

  mount(element) {
    this.element = element;
    if (this.model) {
      this.model.on('change', () => this.onModelChange());
    }
  }

  onModelChange() {
    this.element.innerHTML = this.renderInnerHTML();
  }
}