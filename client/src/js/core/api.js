import moment from 'moment';

import Feed from './feed';


export default class TheatricsAPI {
  constructor() {
    this.prefix = '/api';
    this.fetch = window.fetch.bind(window);
  }

  fetchEvent(id) {
    return this.get(`/events/${id}/`, {expand: 'place,images'});
  }

  fetchPlace(id) {
    return this.get(`/places/${id}/`, {expand: 'images'});
  }

  fetchEventsInPlace(id) {
    return this.getAll(
      '/events/',
      {
        categories: 'theater',
        fields: 'id,title,short_title,dates,location,tagline',
        page_size: 100,
        place_id: id,
        actual_since: moment().unix(),
      }
    );
  }

  getEventsFeed(location, date) {
    date = date ? moment(date) : null;

    const params = {
      categories: 'theater,-kids',
      fields: 'place,images,tagline,id,title,short_title,categories,description',
      expand: 'place,images',
      page_size: 24,
      location: location,
    };

    if (date) {
      params.actual_since = date.unix();
      params.actual_until = date.clone().add(1, 'days').unix();
    } else {
      params.actual_since = moment().unix();
    }

    return new Feed(this, '/events/', params);
  }

  getPlacesFeed(location) {
    const params = {
      fields: 'images,title,id,address',
      categories: 'theatre,-cafe',
      expand: 'images',
      order_by: '-favorites_count',
      page_size: 24,
      location: location,
    };
    return new Feed(this, '/places/', params);
  }

  // generic getting

  getAll(path, params) {
    const feed = new Feed(this, path, params);
    return feed.fetchAll();
  }

  get(path, params) {
    const url = this.buildURL(path);
    const queryString = this.serializeParams(params);
    const fullURL = queryString ? `${url}?${queryString}` : url;
    return this.fetch(fullURL).then(response => response.json());
  }

  buildURL(path) {
    if (path.slice(0, this.prefix.length) == this.prefix) {
      return path;
    } else {
      return this.prefix + path;
    }
  }

  serializeParams(params) {
    if (params) {
      return Object
        .keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    } else {
      return null;
    }
  }
}
