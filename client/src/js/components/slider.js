import Events from 'events-mixin';

import {show, toggle, toggleClass} from '../utils';


export default class Slider {
  constructor(element, isTouchEnabled=true) {
    this.element = element;

    this.isTouching = false;
    this.offset = 0;

    this.selectors = {
      next: element.getAttribute('data-next-button'),
      previous: element.getAttribute('data-previous-button'),
      container: element.getAttribute('data-container'),
      items: element.getAttribute('data-items'),
    }

    this.nextButton = element.querySelector(this.selectors.next);
    this.previousButton = element.querySelector(this.selectors.previous);
    this.container = element.querySelector(this.selectors.container);

    this.events = new Events(element, this);
    this.events.bind(`click ${this.selectors.next}`, 'onNextClicked');
    this.events.bind(`click ${this.selectors.previous}`, 'onPreviousClicked');

    if (isTouchEnabled) {
      this.events.bind('touchstart', 'onTouchStart');
      this.events.bind('touchend', 'onTouchEnd');
      this.events.bind('touchmove', 'onTouchMove');
    }

    if (!this.getActiveItem()) {
      element.querySelector(this.selectors.items).classList.add('active');
    }
  }

  // event handlers

  onNextClicked(event) {
    event.preventDefault();
    this.toNext();
  }

  onPreviousClicked(event) {
    event.preventDefault();
    this.toPrevious();
  }

  onTouchStart(event) {
    this.element.classList.add('touchable');
    if (event.touches.length == 1) {
      const touch = event.touches[0];
      this.isTouching = true;
      this.initialOffset = this.offset;
      this.initialX = touch.screenX;
      this.initialY = touch.screenY;
    } else {
      this.isTouching = false;
    }
  }

  onTouchMove(event) {
    if (this.isTouching) {
      const touch = event.touches[0];
      const offsetX = touch.screenX - this.initialX;
      const offsetY = touch.screenY - this.initialY;
      const isIntentHorizontal = Math.abs(offsetX) > Math.abs(offsetY);
      if (!isIntentHorizontal) {
        this.isTouching = false;
      } else {
        event.preventDefault();
        event.stopPropagation();
        this.move(this.initialOffset + offsetX);
      }
    }
  }

  onTouchEnd(event) {
    const wasTouching = this.isTouching;
    this.isTouching = false;
    if (wasTouching) {
      const delta = this.offset - this.initialOffset;
      if (Math.abs(delta) < 100) {
        this.toActive();
      } else if (delta < 0) {
        this.toNext();
      } else {
        this.toPrevious();
      }
    }
  }

  onTouchCancel(event) {
    this.isTouching = false;
  }

  // moving around

  toActive() {
    const items = this.getItems();
    const activeIndex = this.findActiveIndex(items);
    const active = items[activeIndex];
    this.moveTo(active);
  }

  toNext() {
    const items = this.getItems();
    const activeIndex = this.findActiveIndex(items);

    const active = items[activeIndex];
    const next = items[activeIndex+1];

    if (next) {
      active.classList.remove('active');
      next.classList.add('active');

      this.moveTo(next);

      const hasMore = activeIndex + 2 < items.length;
      toggle(this.nextButton, hasMore);
      show(this.previousButton);
    } else {
      this.moveTo(active);
    }
  }

  toPrevious() {
    const items = this.getItems();
    const activeIndex = this.findActiveIndex(items);

    const active = items[activeIndex];
    const previous = items[activeIndex-1];

    if (previous) {
      active.classList.remove('active');
      previous.classList.add('active');

      this.moveTo(previous);

      const hasLess = activeIndex - 2 >= 0;
      show(this.nextButton);
      toggle(this.previousButton, hasLess);
    } else {
      this.moveTo(active);
    }
  }

  toSpecific(item) {
    const active = this.getActiveItem();
    active.classList.remove('active');
    item.classList.add('active');
    this.moveTo(item);
  }

  moveTo(item) {
    this.move(this.getItemOffset(item));
  }

  move(offset) {
    const [minOffset, maxOffset] = this.getOffsetBounds();
    offset = offset < minOffset ? minOffset : offset;
    offset = offset > maxOffset ? maxOffset : offset;

    this.offset = offset;

    this.container.style.transform = `translateX(${offset}px)`;
    this.container.style.webkitTransform = `translateX(${offset}px)`;
    this.container.style.mozTransform = `translateX(${offset}px)`;
  }

  // getting and working with items

  getActiveItem() {
    const items = this.getItems();
    const index = this.findActiveIndex(items);
    return items[index];
  }

  findActiveIndex(items) {
    for (let index = 0; index < items.length; index++) {
      if (items[index].classList.contains('active')) {
        return index;
      }
    }
  }

  getOffsetBounds() {
    const items = this.getItems();
    return [
      this.getItemOffset(items[items.length-1]),
      this.getItemOffset(items[0]),
    ];
  }

  getItemOffset(item) {
    return -(item.offsetLeft);
  }

  getItems() {
    return this.element.querySelectorAll(this.selectors.items);
  }

  set isTouching(value) {
    toggleClass(this.element, 'touching', value);
  }

  get isTouching() {
    return this.element.classList.contains('touching');
  }
}
