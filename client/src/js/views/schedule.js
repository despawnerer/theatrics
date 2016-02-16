import View from '../base/view';
import {groupArray} from '../utils';

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
    return this.app.renderTemplate(template, {dayGroups});
  }
}
