
export function capfirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function getTimestamp(date) {
  return date / 1000 | 0;
}
