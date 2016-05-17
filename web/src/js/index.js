import 'core-js/fn/promise';
import 'core-js/fn/symbol';
import 'core-js/fn/array';

import 'whatwg-fetch';
import attachFastClick from 'fastclick';

import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';

attachFastClick(document.documentElement);
moment.tz.load(timezones);

const app = new App();
app.run();
