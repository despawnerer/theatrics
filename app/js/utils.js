const API_PREFIX = 'http://kudago.com/public-api/v1';


export function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}


export function buildAPIURL(path) {
  return API_PREFIX + path;
}


export function toggle(element, condition) {
  if (condition) {
    show(element);
  } {
    hide(element);
  }
}

export function show(element) {
	element.removeAttribute('hidden');
}


export function hide(element) {
  element.setAttribute('hidden', 'hidden');
}
