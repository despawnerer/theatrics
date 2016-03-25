import Model from '../base/model';
import {capfirst, makeAbsoluteURL} from '../utils';


export default class Place extends Model {
  isStub() {
    return this.data.is_stub;
  }

  isReference() {
    const keys = Object.keys(this.data);
    return keys.length == 1 && keys[0] == 'id';
  }

  getTitle() {
    return capfirst(this.data.title);
  }

  getPresentFields(...fields) {
    return fields.filter(f => Boolean(this.data[f]))
  }

  toJSONLD(app) {
    const url = app.resolver.reverse('place', {id: this.data.id});

    if (this.isReference()) {
      return {
        '@id': url,
      }
    }

    const result = {
      '@context': 'http://schema.org',
      '@type': 'Place',
      '@id': url,
      name: this.getTitle(),
      address: this.data.address,
    }

    if (!this.isStub()) {
      result.url = makeAbsoluteURL(url);
    }

    if (this.data.foreign_url) {
      result.sameAs = this.data.foreign_url;
    }

    return result;
  }
}
