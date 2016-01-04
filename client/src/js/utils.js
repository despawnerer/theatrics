const API_PREFIX = '/api';


export function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}


export function buildAPIURL(path) {
  return API_PREFIX + path;
}


export function isiOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}


export function forceScroll(x, y, maxAttempts=100) {
  /*
  Sometimes, after navigating somewhere with .pushState, Chrome
  decides to restore scroll position from the previous state after loading.
  No idea what for. No idea why. It just does.
  This function works around that behavior.
  */

  window.scrollTo(x, y);
  let attemptsMade = 0;
  const interval = window.setInterval(() => {
    if (window.scrollX == x && window.scrollY == y) {
      attemptsMade += 1;
      if (attemptsMade >= maxAttempts) {
        window.clearInterval(interval);
      }
    } else {
      window.scrollTo(x, y);
      window.clearInterval(interval);
    }
  }, 1);
}


export function toggleClass(element, className, condition) {
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


export function toggle(element, condition) {
  if (condition) {
    show(element);
  } else {
    hide(element);
  }
}

export function show(element) {
  element.removeAttribute('hidden');
}


export function hide(element) {
  element.setAttribute('hidden', 'hidden');
}


export function regexpEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


export function zipIntoObject(keys, values) {
  const obj = {}
  for (let x = 0; x < values.length; x++) {
    obj[keys[x]] = values[x];
  }
  return obj;
}
