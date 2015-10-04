import ru from 'moment/locale/ru';

import Query from './query';
import Feed from './feed';
import Calendar from './calendar';
import CityChooser from './city-chooser';


document.addEventListener('DOMContentLoaded', function(event) {
  let query = new Query({
    location: 'spb',
    categories: 'theater',
    fields: 'place,images,tagline,id,age_restriction,title,short_title',
    expand: 'place,images',
  });

  query.lock();

  const calendarElement = document.querySelector('.calendar');
  const calendar = new Calendar(calendarElement, query);
  calendar.loadAnyDay();

  const feedContainer = document.querySelector('.feed-container');
  const feed = new Feed(feedContainer, '/events/', query);

  const cityContainer = document.querySelector('.city');
  const cityChooser = new CityChooser(cityContainer, query);

  query.apply();
});
