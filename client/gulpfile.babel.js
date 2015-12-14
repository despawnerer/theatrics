'use strict';

import 'moment-timezone/moment-timezone';
import 'moment-timezone/moment-timezone-utils';

import gulp from 'gulp';
import util from 'gulp-util';

import moment from 'moment';

import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import csswring from 'csswring';
import autoprefixer  from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssAssets from 'postcss-assets';

import browserify from 'browserify';
import watchify from 'watchify';

import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import template from 'gulp-template';

import timezones from 'moment-timezone/data/unpacked/latest.json';
import pkginfo from './package.json';


/* CSS */

gulp.task('build-css', () => {
  return gulp
    .src('src/css/index.css')
    .on('error', logError)
    .pipe(postcss([
      postcssImport,
      autoprefixer,
      postcssAssets({
        loadPaths: ['src']
      }),
    ]))
    .pipe(gulp.dest('build'));
});


gulp.task('watch-css', () => {
  gulp.start(['build-css']);
  gulp.watch('src/css/**/*.css', ['build-css']);
});

gulp.task('build-min-css', ['build-css'], () => {
  return gulp
    .src(['build/*.css', '!build/*.min.css'])
    .pipe(postcss([
      csswring,
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build'));
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
      .on('error', logError)
      .pipe(source(JS_TARGET_FILENAME))
      .pipe(buffer())
      .pipe(gulp.dest('build'));
  }

  if (options.watch) {
    b.on('update', buildBundle);
  }

  return buildBundle();
}

gulp.task('build-js', () => {
  return buildJS({
    debug: true,
  });
});

gulp.task('watch-js', () => {
  buildJS({
    debug: true,
    watch: true,
  });
});

gulp.task('build-min-js', ['build-js'], () => {
  return gulp
    .src('build/index.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build'));
});


/* HTML */

gulp.task('build-html', () => {
  const context = {
    min: false,
    buildDate: new Date(),
    repositoryURL: pkginfo.repositoryURL,
    revision: process.env.GIT_REV || null,
  }
  return gulp
    .src('src/*.ejs')
    .on('error', logError)
    .pipe(template(context))
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
    revision: process.env.GIT_REV || null,
  }
  return gulp
    .src('src/*.ejs')
    .on('error', logError)
    .pipe(template(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});


/* Fonts */

gulp.task('build-fonts', () => {
  return gulp
    .src('src/fonts/*')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('watch-fonts', () => {
  gulp.start(['build-fonts']);
  gulp.watch('src/fonts/*', ['build-fonts']);
});


/* Data */

gulp.task('update-timezones', () => {
  const currentYear = new Date().getFullYear();
  const filteredTimezones = moment.tz.filterLinkPack(
    timezones, currentYear - 3, currentYear + 1);
  const stream = source('timezones.json');
  stream.end(JSON.stringify(filteredTimezones))
  return stream.pipe(gulp.dest('src/data'));
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

function logError(e) {
  util.log(util.colors.red('Error'), e);
}
