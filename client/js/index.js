import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Locations from './locations';
import Settings from './settings';

import LocationChooser from './location-chooser';
import EventsView from './events';

import {show, hide} from './utils';


document.addEventListener('DOMContentLoaded', function(event) {
  const settings = new Settings();
  const locations = new Locations();

  locations.fetch().then(() => {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser(locations, settings);
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  });

  settings.fetch().then(() => {
    const viewContainer = document.querySelector('#view-container');

    const eventsView = new EventsView(settings);
    eventsView.render();
    viewContainer.appendChild(eventsView.element);
  });
});
