import moment from 'moment';

import Event from '../models/event';
import Place from '../models/place';

import EventPage from '../pages/event';
import EventListPage from '../pages/event-list';
import PlacePage from '../pages/place';
import PlaceListPage from '../pages/place-list';
import NotFoundPage from '../pages/not-found';

import {Redirect, Render, NotFound} from './response';


export function index(app) {
  const location = app.settings.get('location');
  return Redirect(app.resolver.reverse('event-list', {location}));
}


export function location(app, {location}) {
  if (!app.locations.has(location)) return notFound(app);
  return Redirect(app.resolver.reverse('event-list', {location}));
}


export function eventList(app, {location, date}) {
  location = app.locations.get(location);
  date = date ? moment.tz(date, location.timezone) : null;
  if (!location) return notFound(app);

  const feed = app.api.getEventsFeed(location, date);
  const page = new EventListPage({app, location, date, feed});
  return Render({page});
}


export function event(app, {id}) {
  return app.api
    .fetchEvent(id)
    .then(data => {
      const event = new Event(data);
      const page = new EventPage({app, event});
      return Render({page});
    });
}


export function placeList(app, {location}) {
  location = app.locations.get(location);
  if (!location) return notFound(app);

  const feed = app.api.getPlacesFeed(location);
  const page = new PlaceListPage({app, location, feed});
  return Render({page});
}


export function place(app, {id}) {
  return app.api
    .fetchPlace(id)
    .then(data => {
      const place = new Place(data);
      const page = new PlacePage({app, place});
      return Render({page});
    });
}


export function notFound(app) {
  const page = new NotFoundPage({app});
  return NotFound({page});
}
