import moment from 'moment';

import Feed from './feed';


export default class TheatricsAPI {
  constructor() {
    this.prefix = '/api/v1';
    this.fetch = window.fetch.bind(window);
  }

  fetchEvent(id) {
    return this.get(`/events/${id}/`, {expand: 'place,parent'});
  }

  fetchPlace(id) {
    return this.get(`/places/${id}/`);
  }

  fetchEventChildren(id) {
    return this.getAll(
      '/events/',
      {
        fields: 'name,full_name,dates,location,tagline,place,is_premiere,kind,price',
        page_size: 100,
        parent: id,
        include_past: true,
      }
    );
  }

  fetchEventsInPlace(id) {
    return this.getAll(
      '/events/',
      {
        fields: 'name,full_name,dates,location,tagline,place,is_premiere,kind,price',
        page_size: 100,
        place: id,
      }
    );
  }

  getEventsFeed(location, date) {
    const params = {
      fields: 'name,full_name,place,images,tagline,lead,is_premiere,kind,end,start,location,price',
      expand: 'place',
      page_size: 24,
      location: location.slug,
    };

    if (date) params.date = date.format('YYYY-MM-DD');

    return new Feed(this, '/events/', params);
  }

  getPlacesFeed(location) {
    const params = {
      fields: 'full_name,name,images,address,url,location',
      page_size: 24,
      location: location.slug,
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
    return this.fetch(fullURL)
      .then(response => {
        if (!response.ok) {
          const error = new Error(response.statusText);
          error.response = response;
          throw error;
        } else {
          return response.json();
        }
      });
  }

  buildURL(path) {
    if (path.startsWith(this.prefix)) {
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
