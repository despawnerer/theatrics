import 'core-js/es6/promise';
import 'core-js/es6/symbol';
import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';

moment.tz.load(timezones);

document.addEventListener('DOMContentLoaded', (event) => {
  const app = new App();
  app.run();
});
