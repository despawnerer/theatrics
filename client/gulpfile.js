var gulp = require('gulp');
var util = require('gulp-util');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var browserify = require('browserify');
var watchify = require('watchify');

var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var template = require('gulp-template');


function logError(e) {
  util.log(util.colors.red('Error'), e);
}


/* CSS */

gulp.task('build-css', function() {
  return gulp.src('src/css/index.css')
    .on('error', logError)
    .pipe(postcss([
      require('postcss-import')(),
      require('autoprefixer')(),
      require('postcss-assets')({
        loadPaths: ['src']
      }),
    ]))
    .pipe(gulp.dest('build'));
});


gulp.task('watch-css', function () {
  gulp.start(['build-css']);
  gulp.watch('src/css/**/*.css', ['build-css']);
});

gulp.task('build-min-css', ['build-css'], function () {
  return gulp.src(['build/*.css', '!build/*.min.css'])
    .pipe(postcss([
      require('csswring')()
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build'));
});


/* JS */

const JS_ENTRIES = ['src/js/index.js'];
const JS_TARGET_FILENAME = 'index.js';

function buildJS(options) {
  var b = browserify({
    entries: JS_ENTRIES,
    debug: options.debug,

    // watchify support
    plugin: options.watch ? [watchify] : [],
    cache: {},
    packageCache: {}
  });

  var buildBundle = function() {
    var stream = b.bundle()
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

gulp.task('build-js', function () {
  return buildJS({
    debug: true,
  });
});

gulp.task('watch-js', function () {
  buildJS({
    debug: true,
    watch: true,
  });
});

gulp.task('build-min-js', ['build-js'], function () {
  return gulp.src('build/index.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build'));
});


/* HTML */

gulp.task('build-html', function() {
  var context = {
    min: false,
    buildDate: new Date(),
  }
  return gulp.src('src/*.ejs')
    .on('error', logError)
    .pipe(template(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});

gulp.task('watch-html', function() {
  gulp.start(['build-html']);
  gulp.watch('src/*.ejs', ['build-html']);
});

gulp.task('build-min-html', function() {
  var context = {
    min: true,
    buildDate: new Date(),
  }
  return gulp.src('src/*.ejs')
    .on('error', logError)
    .pipe(template(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});


/* Fonts */

gulp.task('build-fonts', function() {
  return gulp.src('src/fonts/*').pipe(gulp.dest('build/fonts'));
});

gulp.task('watch-fonts', function() {
  gulp.start(['build-fonts']);
  gulp.watch('src/fonts/*', ['build-fonts']);
});


/* Big tasks */

gulp.task('watch', function () {
  gulp.start('watch-css');
  gulp.start('watch-js');
  gulp.start('watch-html');
  gulp.start('watch-fonts');
});

gulp.task('build', ['build-css', 'build-js', 'build-html', 'build-fonts']);
gulp.task('build-min', [
  'build-min-css', 'build-min-js', 'build-min-html', 'build-fonts']);
