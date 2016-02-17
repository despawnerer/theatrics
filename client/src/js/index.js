import 'core-js/es5';
import 'core-js/es6/promise';
import 'core-js/es6/symbol';
import 'core-js/es6/array';
import 'core-js/modules/es6.string.ends-with';
import 'core-js/modules/es6.string.starts-with';
import 'whatwg-fetch';

import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';

moment.tz.load(timezones);

const app = new App();
app.run();
