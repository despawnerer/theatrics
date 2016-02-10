export default class TheatricsAPI {
  constructor() {
    this.prefix = '/api';
    this.fetch = window.fetch;
  }

  fetchEvent(id) {
    return this.get(`/events/${id}/`, {expand: 'place,images'});
  }

  fetchPlace(id) {
    return this.get(`/places/${id}/`, {expand: 'images'});
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
