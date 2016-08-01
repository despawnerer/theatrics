import 'core-js/fn/promise';

import attachFastClick from 'fastclick';
import attachSoftKeyboardEvents from './utils/soft-keyboard-events';

import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';
import Navigator from './core/navigator';

attachFastClick(document.documentElement);
attachSoftKeyboardEvents(window);
moment.tz.load(timezones);

const app = new App();
const navigator = new Navigator(app);
navigator.start();
