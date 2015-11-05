import Events from 'events-mixin';


export default class View {
  constructor({app, model}) {
    this.app = app;

    this.element = this.createElement();

    this.events = new Events(this.element, this);

    if (model) {
      this.onModelChange = this.onModelChange.bind(this);
      this.model = model;
      this.model.on('change', this.onModelChange);
    }
  }

  unbind() {
    this.events.unbind();

    if (this.model) {
      this.model.removeListener('change', this.onModelChange);
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