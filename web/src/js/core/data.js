import locationList from '../../data/locations.json';
import roleList from '../../data/roles.json';


class UniquelyIndexedArray {
  constructor(key, items) {
    this.items = items;
    this.key = key;
  }

  forEach() { return this.items.forEach.apply(this.items, arguments); }
  find() { return this.items.find.apply(this.items, arguments); }

  has(value) {
    return Boolean(this.get(value));
  }

  get(value) {
    return this.find(x => x[this.key] == value);
  }
}


export const locations = new UniquelyIndexedArray('slug', locationList);
export const roles = new UniquelyIndexedArray('slug', roleList);
