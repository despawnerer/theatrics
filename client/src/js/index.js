import 'core-js/es5';
import 'core-js/fn/promise';
import 'core-js/fn/symbol';
import 'core-js/fn/array';
import 'core-js/fn/string/ends-with';
import 'core-js/fn/string/starts-with';
import 'core-js/fn/string/includes';

import intlModule from 'intl/lib/core';
import intlRu from 'intl/locale-data/json/ru';

import 'whatwg-fetch';
import attachFastClick from 'fastclick';
import raf from 'raf';

import 'moment-timezone/moment-timezone';
import 'moment/locale/ru';

import moment from 'moment';

import timezones from '../data/timezones.json';
import App from './core/app';

raf.polyfill();
attachFastClick(document.documentElement);
moment.tz.load(timezones);
intlModule.default.__addLocaleData(intlRu);
intlModule.default.__applyLocaleSensitivePrototypes();

const app = new App();
app.run();
