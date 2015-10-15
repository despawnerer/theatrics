import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Locations from './locations';
import Options from './options';

import LocationChooser from './location-chooser';
import EventsView from './events';

import {show, hide} from './utils';


document.addEventListener('DOMContentLoaded', function(event) {
  const options = new Options();
  const locations = new Locations();

  locations.fetch().then(() => {
    const locationContainer = document.querySelector('#city');
    const locationChooser = new LocationChooser(locations, options);
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);
    show(locationContainer);
  });

  options.fetch().then(() => {
    const viewContainer = document.querySelector('#view-container');

    const eventsView = new EventsView(options);
    eventsView.render();
    viewContainer.appendChild(eventsView.element);
  });
});
