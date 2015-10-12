import ru from 'moment/locale/ru';
import lazysizes from 'lazysizes';

import Locations from './locations';
import Options from './options';

import Query from './query';
import Feed from './feed';
import Calendar from './calendar';
import LocationChooser from './location-chooser';


document.addEventListener('DOMContentLoaded', function(event) {
  const options = new Options();
  const locations = new Locations();

  Promise.all([
    locations.fetch(),
    options.fetch()
  ]).then(() => {
    const query = new Query({
      location: options.get('location'),
      categories: 'theater',
      fields: 'place,images,tagline,id,age_restriction,title,short_title',
      expand: 'place,images',
    });

    options.on('change', (key, value) => { if (key == 'location') { query.update({location: value})} })

    query.lock();

    const locationChooserElement = document.querySelector('#city');
    const locationChooser = new LocationChooser(locationChooserElement, locations, options);
    locationChooser.render();

    const calendarElement = document.querySelector('.calendar');
    const calendar = new Calendar(calendarElement, query);
    calendar.loadAnyDay();

    const feedContainer = document.querySelector('.feed-container');
    const feed = new Feed(feedContainer, '/events/', query);

    query.apply();

  })
});
