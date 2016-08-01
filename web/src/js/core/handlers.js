import moment from 'moment';

import locations from './locations';

import Event from '../models/event';
import Place from '../models/place';

import EventPage from '../pages/event';
import EventListPage from '../pages/event-list';
import PlacePage from '../pages/place';
import PlaceListPage from '../pages/place-list';
import SearchPage from '../pages/search';
import NotFoundPage from '../pages/not-found';

import {
  redirect,
  render,
  notFound as notFoundResponse
} from './response';


export function index(request) {
  const app = request.app;
  const location = request.state.location.slug;
  return redirect(app.url('event-list', {location}));
}


export function location(request, {location}) {
  if (!locations.has(location)) return notFound(request);

  const app = request.app;
  return redirect(app.url('event-list', {location}));
}


export function eventList(request, {location, date}) {
  location = locations.get(location);
  date = date ? moment.tz(date, location.timezone) : null;
  if (!location) return notFound(request);

  const app = request.app;
  const feed = app.api.getEventsFeed(location, date);
  const page = new EventListPage({app, location, date, feed});
  return render({page, location});
}


export function event(request, {id}) {
  const app = request.app;
  return app.api
    .fetchEvent(id)
    .then(data => {
      const event = new Event(data);
      const page = new EventPage({app, event});
      const location = event.getLocation();
      return render({page, location});
    })
    .catch(error => error.response.status == 404 ? notFound(request) : undefined);
}


export function placeList(request, {location}) {
  location = locations.get(location);
  if (!location) return notFound(request);

  const app = request.app;
  const feed = app.api.getPlacesFeed(location);
  const page = new PlaceListPage({app, location, feed});
  return render({page, location});
}


export function place(request, {id}) {
  const app = request.app;
  return app.api
    .fetchPlace(id)
    .then(data => {
      const place = new Place(data);
      const page = new PlacePage({app, place});
      const location = place.getLocation();
      return render({page, location});
    })
    .catch(error => error.response.status == 404 ? notFound(request) : undefined);
}


export function search(request, {location}) {
  location = locations.get(location);
  if (!location) return notFound(request);

  const app = request.app;
  const query = request.query.q;
  const feed = app.api.getSearchFeed(query, location);
  const page = new SearchPage({app, location, query, feed});
  return render({page, location});
}


export function notFound(request) {
  const app = request.app;
  const page = new NotFoundPage({app});
  return notFoundResponse({page});
}
