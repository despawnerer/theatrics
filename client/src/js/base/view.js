import Events from 'events-mixin';


export default class View {
  constructor({app, model}) {
    this.app = app;

    this.element = this.createElement();

    this.events = new Events(this.element, this);

    if (model) {
      this.model = model;
      this.model.on('change', this.onModelChange.bind(this));
    }
  }

  createElement() {
    return document.createElement('div');
  }

  render() {

  }

  onModelChange() {
    this.render();
  }
}