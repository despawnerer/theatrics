import View from '../base/view';
import {capfirst, groupArray} from '../utils';

import template from '../../templates/schedule.ejs';


export default class ScheduleView extends View {
  constructor({app, dates}) {
    super({app});
    this.dates = dates;
  }

  getHTML() {
    const dayGroups = groupArray(
      this.dates, 'day',
      date => date.start.clone().startOf('day'),
      (day1, day2) => day1.isSame(day2)
    );
    return template({
      capfirst,
      app: this.app,
      dayGroups: dayGroups,
    });
  }
}
