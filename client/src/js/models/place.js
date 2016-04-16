import Model from '../base/model';
import {capfirst, makeAbsoluteURL} from '../utils';


export default class Place extends Model {
  isStub() {
    return this.data.is_stub;
  }

  isReference() {
    return typeof this.data == 'number';
  }

  getName() {
    return capfirst(this.data.full_name);
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
      name: this.getName(),
      address: this.data.address,
    }

    if (!this.isStub()) {
      result.url = makeAbsoluteURL(url);
    }

    if (this.data.url) {
      result.sameAs = this.data.url;
    }

    return result;
  }
}
