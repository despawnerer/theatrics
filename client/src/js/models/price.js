import Model from '../base/model';

import {formatPriceRange} from '../utils';


export default class Price {
  constructor(event, data) {
    this.event = event;
    this.data = data;
  }

  hasRange() {
    return this.data.lower != null || this.data.upper != null;
  }

  toString() {
    if (this.hasRange()) {
      const currency = this.event.getLocation().currency;
      return formatPriceRange(this.data.lower, this.data.upper, currency);
    } else {
      return this.data.text;
    }
  }

  toJSONLD(app) {
    if (this.hasRange()) {
      const currency = this.event.getLocation().currency;
      const offer = {
        '@type': 'AggregateOffer',
        priceCurrency: currency,
      }
      if (this.data.lower != null) offer.lowPrice = this.data.lower;
      if (this.data.upper != null) offer.highPrice = this.data.upper;
      return offer;
    }
  }
}
