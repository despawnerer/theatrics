import 'core-js/es5';
import 'core-js/fn/promise';
import 'core-js/fn/symbol';
import 'core-js/fn/array';
import 'core-js/fn/string/ends-with';
import 'core-js/fn/string/starts-with';
import 'whatwg-fetch';
import raf from 'raf';

import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';

moment.tz.load(timezones);
raf.polyfill();

const app = new App();
app.run();
