import Query from './query';
import Calendar from './calendar';
import Feed from './feed';


export default class EventsView {
  constructor(options, date=null) {
    this.options = options;
    this.date = date;

    this.element = document.createElement('div');

    this.query = new Query(
      '/events/',
      {
        location: options.get('location'),
        categories: 'theater',
        fields: 'place,images,tagline,id,age_restriction,title,short_title',
        expand: 'place,images',
      });

    this.calendar = new Calendar(this.query);
    this.feed = new Feed(this.query);

    options.on('change', this.onOptionsChange.bind(this));
  }

  render() {
    for (let view of [this.calendar, this.feed]) {
      view.render();
      this.element.appendChild(view.element);
    }

    if (this.date == null) {
      this.calendar.setAnyDay();
    } else {
      this.calendar.setDay(this.date);
    }
  }

  onOptionsChange(key, value) {
    if (key == 'location') {
      this.query.set('location', value);
    }
  }
}



