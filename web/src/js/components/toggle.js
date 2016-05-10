import {show, hide, toggle} from '../utils';


export default class Toggle {
  constructor(element, context=document) {
    this.element = element;
    this.target = context.querySelector(element.getAttribute('data-target'));
    this.backdrop = context.querySelector(element.getAttribute('data-backdrop'));
    this.attach();
  }

  attach() {
    this.element.addEventListener('click', event => this.toggle());
    this.backdrop.addEventListener('click', event => this.hide())
  }

  toggle() {
    toggle(this.target);
  }

  show() {
    show(this.target);
  }

  hide() {
    hide(this.target);
  }
}
