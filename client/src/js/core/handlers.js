import moment from 'moment';

import Event from '../models/event';
import Place from '../models/place';

import EventPage from '../pages/event';
import EventListPage from '../pages/event-list';
import PlacePage from '../pages/place';
import PlaceListPage from '../pages/place-list';
import NotFoundPage from '../pages/not-found';


export function index(app) {
  const location = app.settings.get('location');
  return app.resolver.reverse('event-list', {location});
}


export function location(app, {location}) {
  return app.resolver.reverse('event-list', {location});
}


export function eventList(app, {location, date}) {
  location = app.locations.get(location);
  date = date ? moment.tz(date, location.timezone) : null;
  const feed = app.api.getEventsFeed(location, date);
  return new EventListPage({app, location, date, feed});
}


export function event(app, {id}) {
  return app.api
    .fetchEvent(id)
    .then(data => new Event(data))
    .then(event => new EventPage({app, event}));
}


export function placeList(app, {location}) {
  location = app.locations.get(location);
  const feed = app.api.getPlacesFeed(location);
  return new PlaceListPage({app, location, feed});
}


export function place(app, {id}) {
  return app.api
    .fetchPlace(id)
    .then(data => new Place(data))
    .then(place => new PlacePage({app, place}));
}


export function notFound(app) {
  return new NotFoundPage({app});
}