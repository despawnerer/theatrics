export function zipIntoObject(keys, values) {
  const obj = {}
  for (let x = 0; x < values.length; x++) {
    obj[keys[x]] = values[x];
  }
  return obj;
}


export function merge(...objects) {
  return Object.assign({}, ...objects);
}


export function pluck(objects, key) {
  return objects.map(o => o[key]);
}
