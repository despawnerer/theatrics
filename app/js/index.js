import Query from './query';
import Feed from './feed';
import Calendar from './calendar';


document.addEventListener('DOMContentLoaded', function(event) {
  let query = new Query({
    location: 'spb',
    categories: 'theater',
    fields: 'place,dates,images,tagline,id,age_restriction,title,short_title',
    expand: 'place,images',
  });

  query.lock();

  let calendarElement = document.querySelector('.calendar');
  let calendar = new Calendar(calendarElement, query);
  calendar.loadAnyDay();

  let feedContainer = document.querySelector('.feed-container');
  let feed = new Feed(feedContainer, '/events/', query);

  query.apply();
});
