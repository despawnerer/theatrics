import moment from 'moment';
import qs from 'query-string';

import Feed from './feed';


export default class TheatricsAPI {
  constructor() {
    this.prefix = '/api';
    this.version_prefix = '/v1'
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
    const query = {
      fields: 'name,full_name,place,images,tagline,lead,is_premiere,kind,end,start,location,price',
      expand: 'place',
      page_size: 24,
      location: location.slug,
    };

    if (date) query.date = date.format('YYYY-MM-DD');

    return new Feed(this, '/events/', query);
  }

  getPlacesFeed(location) {
    const query = {
      fields: 'full_name,name,images,address,url,location',
      page_size: 24,
      location: location.slug,
    };
    return new Feed(this, '/places/', query);
  }

  getSearchFeed(q, location) {
    const query = {
      fields: 'full_name,name,images,address,working_hours,location,start,end,tagline,place,is_premiere,kind,lead,dates',
      expand: 'place',
      page_size: 24,
      q: q,
      location: location.slug,
    }
    return new Feed(this, '/search/', query);
  }

  // generic getting

  getAll(path, query) {
    const feed = new Feed(this, path, query);
    return feed.fetchAll();
  }

  get(path, query) {
    const url = this.buildURL(path);
    const queryString = qs.stringify(query);
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
    } else if (path.startsWith(this.version_prefix)) {
      return this.prefix + path;
    } else {
      return this.prefix + this.version_prefix + path;
    }
  }
}
