import View from '../base/view';

import {groupArray} from '../utils/arrays';

import template from '../../templates/schedule.ejs';


export default class ScheduleView extends View {
  constructor({app, dates}) {
    super({app});
    this.dates = dates;
  }

  getHTML() {
    const rangeGroups = groupArray(
      this.dates, 'range',
      date => date.getDateRange(),
      (range1, range2) => {
        return (
          range1.start.isSame(range2.start) &&
          range1.end.isSame(range2.end)
        )
      }
    );
    return this.app.renderTemplate(template, {rangeGroups});
  }
}
