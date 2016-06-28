import moment from 'moment';

import locations from './locations';

import Event from '../models/event';
import Place from '../models/place';

import EventPage from '../pages/event';
import EventListPage from '../pages/event-list';
import PlacePage from '../pages/place';
import PlaceListPage from '../pages/place-list';
import NotFoundPage from '../pages/not-found';

import {
  redirect,
  render,
  notFound as notFoundResponse
} from './response';


export function index(app, state) {
  const location = state.location.slug;
  return redirect(app.url('event-list', {location}));
}


export function location(app, state, {location}) {
  if (!locations.has(location)) return notFound(app);
  return redirect(app.url('event-list', {location}));
}


export function eventList(app, state, {location, date}) {
  location = locations.get(location);
  date = date ? moment.tz(date, location.timezone) : null;
  if (!location) return notFound(app);

  const feed = app.api.getEventsFeed(location, date);
  const page = new EventListPage({app, location, date, feed});
  return render({page, location});
}


export function event(app, state, {id}) {
  return app.api
    .fetchEvent(id)
    .then(data => {
      const event = new Event(data);
      const page = new EventPage({app, event});
      const location = event.getLocation();
      return render({page, location});
    })
    .catch(error => error.response.status == 404 ? notFound(app) : undefined);
}


export function placeList(app, state, {location}) {
  location = locations.get(location);
  if (!location) return notFound(app);

  const feed = app.api.getPlacesFeed(location);
  const page = new PlaceListPage({app, location, feed});
  return render({page, location});
}


export function place(app, state, {id}) {
  return app.api
    .fetchPlace(id)
    .then(data => {
      const place = new Place(data);
      const page = new PlacePage({app, place});
      const location = place.getLocation();
      return render({page, location});
    })
    .catch(error => error.response.status == 404 ? notFound(app) : undefined);
}


export function notFound(app) {
  const page = new NotFoundPage({app});
  return notFoundResponse({page});
}
