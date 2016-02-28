import escape from 'lodash.escape';


/* Browser and window tools */

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


/* HTML snippets */

export function bigLoader(progress=0.25) {
  return `<div class="big-loader-container">${loader(progress)}</div>`;
}


export function loader(progress=0.25) {
  const dashOffset = 565.48 * (1 - progress);
  return `
    <svg class="loader" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin">
      <circle r="90" cx="100" cy="100" fill="transparent"
              stroke-dasharray="565.48" stroke-dashoffset="0"
              style="stroke-dashoffset: ${dashOffset}px;">
      </circle>
    </svg>
  `
}


/* Element manipulations */

export function clear(element) {
  element.innerHTML = '';
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
  element.removeAttribute('hidden');
}


export function hide(element) {
  element.setAttribute('hidden', 'hidden');
}


/* Generic */

export function restrictBreaks(string, separator=', ') {
  return string
    .split(separator)
    .map(part => `<nobr>${escape(part)}</nobr>`)
    .join(separator);
}


export function niceURL(s) {
  if (s.endsWith('/')) s = s.substr(0, s.length - 1);
  if (s.startsWith('http://')) s = s.substr(7, s.length - 7);
  if (s.startsWith('https://')) s = s.substr(8, s.length - 8);
  return s;
}


export function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}


export function range(bound) {
  const range = [];
  for (let n = 0; n <= bound; n++) {
    range.push(n);
  }
  return range;
}


export function groupArray(array, name, callback, equal=(a, b) => a == b) {
  const groups = [];
  let lastGroup = null;
  array.forEach(item => {
    const groupValue = callback(item);
    if (lastGroup && equal(lastGroup[name], groupValue)) {
      lastGroup.items.push(item);
    } else {
      lastGroup = {items: [item]};
      lastGroup[name] = groupValue;
      groups.push(lastGroup);
    }
  });
  return groups;
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

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
