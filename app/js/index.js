import Feed from './feed';
import Calendar from './calendar';


document.addEventListener('DOMContentLoaded', function(event) {
  let feedContainer = document.querySelector('.feed-container');
  let feed = new Feed(
    container,
    '/events/',
    {
        location: 'spb',
        categories: 'theater',
        fields: 'place,dates,images,tagline,id,age_restriction,title',
        expand: 'place,images',
    });

  let calendarElement = document.querySelector('.calendar');
  let calendar = new Calendar(calendarElement, feed);
  calendar.load(calendar.getAnyDateQuery());

});
