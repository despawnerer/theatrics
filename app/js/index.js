import {Feed} from './feed';
import {getTimestamp} from './utils';


document.addEventListener('DOMContentLoaded', function(event) {
  let container = document.querySelector('.feed-container');
  let feed = new Feed(
    container,
    '/events/',
    {
        location: 'spb',
        categories: 'theater',
        fields: 'place,description,dates,images,tagline,id,age_restriction,price,title',
        expand: 'place',
        actual_since: getTimestamp(Date.now()),
    });
  feed.loadMore();
});
