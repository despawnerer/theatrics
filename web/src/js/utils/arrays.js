export function range(bound) {
  const range = [];
  for (let n = 0; n <= bound; n++) {
    range.push(n);
  }
  return range;
}


export function rotateLeft(array, n) {
  return array.slice(n).concat(array.slice(0, n));
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
