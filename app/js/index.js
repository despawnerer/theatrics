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

  Promise.all([
    locations.fetch(),
    options.fetch()
  ]).then(() => {
    const locationContainer = document.querySelector('#city');
    const viewContainer = document.querySelector('#view-container');

    const locationChooser = new LocationChooser(locations, options);
    locationChooser.render();
    locationContainer.appendChild(locationChooser.element);

    const eventsView = new EventsView(options);
    eventsView.render();
    viewContainer.appendChild(eventsView.element);

    show(locationContainer);
  });
});
