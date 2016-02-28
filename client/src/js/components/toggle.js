import {show, hide, toggle} from '../utils';


export default class Toggle {
  constructor(element) {
    this.element = element;
    this.contentSelector = element.getAttribute('data-toggle');
    this.attach();
  }

  attach() {
    this.element.addEventListener('click', event => this.toggle());
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick(event) {
    const target = event.target;
    const content = this.getContentElements();

    const isInsideToggle = this.element.contains(target);
    const isInsideContent = content.some(element => element.contains(target));
    if (isInsideToggle || isInsideContent) {
      return;
    }

    this.hide();
  }

  toggle() {
    this.getContentElements().forEach(element => toggle(element));
  }

  show() {
    this.getContentElements().forEach(show);
  }

  hide() {
    this.getContentElements().forEach(hide);
  }

  getContentElements() {
    return Array.from(document.querySelectorAll(this.contentSelector));
  }
}
