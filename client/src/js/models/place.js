import Model from '../base/model';
import {capfirst, makeAbsoluteURL} from '../utils';


export default class Place extends Model {
  isStub() {
    return this.data.is_stub;
  }

  getTitle() {
    return capfirst(this.data.title);
  }

  getPresentFields(...fields) {
    return fields.filter(f => Boolean(this.data[f]))
  }

  toJSONLD(app) {
    const url = app.resolver.reverse('place', {id: this.data.id});
    const result = {
      '@context': 'http://schema.org',
      '@type': 'Place',
      name: this.getTitle(),
      address: this.data.address,
      url: makeAbsoluteURL(url),
    }
    if (this.data.foreign_url) result.sameAs = this.data.foreign_url;
    return result;
  }
}
