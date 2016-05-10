import Events from 'events-mixin';

import Slider from './slider.js';


export default class Pager {
  constructor(element) {
    this.element = element;

    this.selectors = {
      nav: element.getAttribute('data-nav-items'),
      slider: element.getAttribute('data-slider'),
    }

    this.events = new Events(element, this);
    this.events.bind(`click ${this.selectors.nav}`, 'onNavClicked');

    this.sliderElement = element.querySelector(this.selectors.slider);
    this.slider = new Slider(this.sliderElement, false);
  }

  // event handlers

  onNavClicked(event) {
    const previousNav = this.getActiveNav();
    const thisNav = event.delegateTarget;

    const targetSelector = thisNav.getAttribute('for');
    const targetPage = this.element.querySelector(targetSelector);
    this.slider.toSpecific(targetPage);

    previousNav.classList.remove('active');
    thisNav.classList.add('active');
  }

  // utils

  getActiveNav() {
    const navElements = this.getNavElements();
    for (let i = 0, element; element = navElements[i++];) {
      if (element.classList.contains('active')) {
        return element;
      }
    }
  }

  getNavElements() {
    return this.element.querySelectorAll(this.selectors.nav);
  }
}
