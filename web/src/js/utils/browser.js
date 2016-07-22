export function isiOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}


export function getURL(location) {
  return location.pathname + location.search;
}


export function trigger(target, name, detail) {
  const event = detail ? new CustomEvent(name, {detail}) : new Event(name);
  target.dispatchEvent(event);
}
