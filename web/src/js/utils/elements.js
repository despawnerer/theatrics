export function replace(oldElement, newElement) {
  if (oldElement.parentNode) {
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }
  return newElement;
}


export function clear(element) {
  element.innerHTML = '';
}


export function toggleClass(element, className, condition=undefined) {
  /* This shim is used because older Safari and IE don't support
     the second arg to classList.toggle */
  if (condition === undefined) {
    condition = element.classList.contains(className);
  }

  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}


export function toggle(element, condition=undefined) {
  if (condition === undefined) {
    condition = element.hasAttribute('hidden');
  }

  if (condition) {
    show(element);
  } else {
    hide(element);
  }
}

export function show(element) {
  element && element.removeAttribute('hidden');
}


export function hide(element) {
  element && element.setAttribute('hidden', 'hidden');
}


export function isVisible(element) {
  return element && !element.hasAttribute('hidden');
}
