import locationsData from '../../data/locations.json';


export class Locations {
  constructor(locationsData) {
    this._locations = locationsData;
  }

  has(slug) {
    return Boolean(this.get(slug));
  }

  get(slug) {
    return this._locations.find(x => x.slug == slug);
  }

  forEach(func) {
    this._locations.forEach(func);
  }
}

const locations = new Locations(locationsData);

export default locations;
