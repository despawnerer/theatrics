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


export function regexpEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


export function getKeys(obj) {
  const keys = [];
  for (let x in obj) {
    keys.push(x);
  }
  return keys;
}


export function zipIntoObject(keys, values) {
  const obj = {}
  for (let x = 0; x < values.length; x++) {
    obj[keys[x]] = values[x];
  }
  return obj;
}
