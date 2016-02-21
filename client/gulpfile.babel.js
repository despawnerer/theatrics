'use strict';

import 'moment-timezone/moment-timezone';
import 'moment-timezone/moment-timezone-utils';

import fs from 'fs';
import moment from 'moment';
import request from 'request';

import gulp from 'gulp';
import util from 'gulp-util';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import template from 'gulp-template';

import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import through from 'through2';

import csswring from 'csswring';
import autoprefixer  from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssAssets from 'postcss-assets';

import browserify from 'browserify';
import watchify from 'watchify';

import allTimezones from 'moment-timezone/data/unpacked/latest.json';
import pkginfo from './package.json';


/* CSS */

gulp.task('build-css', () => {
  return gulp
    .src('src/css/index.css')
    .pipe(postcss([
      postcssImport,
      autoprefixer,
      postcssAssets({
        loadPaths: ['src']
      }),
    ]))
    .on('error', e => logError('build-css', e.message))
    .pipe(gulp.dest('build/static'));
});


gulp.task('watch-css', () => {
  gulp.start(['build-css']);
  gulp.watch('src/css/**/*.css', ['build-css']);
});

gulp.task('build-min-css', ['build-css'], () => {
  return gulp
    .src(['build/static/*.css', '!build/static/*.min.css'])
    .pipe(postcss([
      csswring,
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/static'));
});


/* JS */

const JS_ENTRIES = ['src/js/index.js'];
const JS_TARGET_FILENAME = 'index.js';

function buildJS(options) {
  const b = browserify({
    entries: JS_ENTRIES,
    debug: options.debug,

    // watchify support
    plugin: options.watch ? [watchify] : [],
    cache: {},
    packageCache: {}
  });

  const buildBundle = () => {
    return b
      .bundle()
      .on('error', e => logError(options.task, formatBrowserifyError(e)))
      .pipe(source(JS_TARGET_FILENAME))
      .pipe(buffer())
      .pipe(gulp.dest('build/static'));
  }

  if (options.watch) {
    b.on('update', buildBundle);
    b.on('log', msg => util.log(`Generated ${JS_TARGET_FILENAME}: ${msg}`))
  }

  return buildBundle();
}

gulp.task('build-js', () => {
  return buildJS({
    debug: true,
    task: 'build-js',
  });
});

gulp.task('watch-js', () => {
  buildJS({
    debug: true,
    watch: true,
    task: 'watch-js',
  });
});

gulp.task('build-min-js', ['build-js'], () => {
  return gulp
    .src('build/static/index.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/static'));
});


/* HTML */

gulp.task('build-html', () => {
  const context = {
    min: false,
    buildDate: new Date(),
    repositoryURL: pkginfo.repositoryURL,
  }
  return gulp
    .src('src/*.ejs')
    .pipe(template(context))
    .on('error', e => logError('build-html', formatTemplateError(e)))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});

gulp.task('watch-html', () => {
  gulp.start(['build-html']);
  gulp.watch('src/*.ejs', ['build-html']);
});

gulp.task('build-min-html', () => {
  const context = {
    min: true,
    buildDate: new Date(),
    repositoryURL: pkginfo.repositoryURL,
  }
  return gulp
    .src('src/*.ejs')
    .pipe(template(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});


/* Fonts */

gulp.task('build-fonts', () => {
  return gulp
    .src('src/fonts/*')
    .pipe(gulp.dest('build/static/fonts'));
});

gulp.task('watch-fonts', () => {
  gulp.start(['build-fonts']);
  gulp.watch('src/fonts/*', ['build-fonts']);
});


/* Data */

const DISABLED_LOCATIONS = ['ufa', 'vbg', 'smr', 'krd'];
const LOCATION_TIMEZONE_OVERRIDES = {
  spb: 'Europe/Moscow',
  msk: 'Europe/Moscow',
  vbg: 'Europe/Moscow',
  nnv: 'Europe/Moscow',
  kzn: 'Europe/Moscow',
  sochi: 'Europe/Moscow',
  krd: 'Europe/Moscow',
}

gulp.task('update-timezones', () => {
  const locations = readJSON('src/data/locations.json');
  const locationTimezones = locations.map(location => location.timezone);
  const timezones = {
    version: allTimezones.version,
    zones: allTimezones.zones
      .filter(zone => locationTimezones.indexOf(zone.name) >= 0),
    links: [],
  }

  const year = new Date().getFullYear();
  const tzBundle = moment.tz.filterLinkPack(timezones, year - 5, year + 20);
  return stringSrc('timezones.json', JSON.stringify(tzBundle))
    .pipe(gulp.dest('src/data'));
});

gulp.task('update-locations', () => {
  const url = 'http://kudago.com/public-api/v1/locations/';
  const qs = {
    lang: 'ru',
    fields: 'name,slug,timezone,coords,language',
    order_by: 'name'
  };
  return request.get(url, {qs})
    .pipe(source('locations.json'))
    .pipe(buffer())
    .pipe(through.obj((file, encoding, callback) => {
      const contents = file.contents.toString(encoding);
      const fetchedLocations = JSON.parse(contents);
      const locations = fetchedLocations
        .filter(location => location.language == 'ru')
        .filter(location => DISABLED_LOCATIONS.indexOf(location.slug) < 0)
        .map(location => {
          if (location.slug in LOCATION_TIMEZONE_OVERRIDES) {
            location.timezone = LOCATION_TIMEZONE_OVERRIDES[location.slug];
          }
          return location;
        });
      file.contents = new Buffer(JSON.stringify(locations));
      callback(null, file);
    }))
    .pipe(gulp.dest('src/data'));
});


/* Big tasks */

gulp.task('watch', () => {
  gulp.start('watch-css');
  gulp.start('watch-js');
  gulp.start('watch-html');
  gulp.start('watch-fonts');
});

gulp.task('build', [
  'build-css',
  'build-js',
  'build-html',
  'build-fonts',
]);

gulp.task('build-min', [
  'build-min-css',
  'build-min-js',
  'build-min-html',
  'build-fonts'
]);


/* Utils */

function logError(task, message) {
  util.log(
    `${util.colors.red('Error')} in '${util.colors.cyan(task)}':\n`,
    message
  );
}


function formatBrowserifyError(error) {
  return `${error.name}: ${error.message}\n${error.codeFrame}`;
}


function formatTemplateError(error) {
  return `${error.name}: ${error.fileName}: ${error.message}`
}


function stringSrc(filename, str) {
  const stream = source(filename);
  stream.end(str)
  return stream;
}


function readJSON(filename) {
  return JSON.parse(fs.readFileSync(filename));
}
