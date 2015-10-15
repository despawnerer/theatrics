const API_PREFIX = '/api';


export function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}


export function buildAPIURL(path) {
  return API_PREFIX + path;
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
