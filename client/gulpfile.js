var gulp = require('gulp');
var postcss = require('gulp-postcss');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var util = require('gulp-util');
var ejs = require('gulp-ejs');
var rename = require('gulp-rename');
var closurecompiler = require('closurecompiler');
var map = require('map-stream');


function logError(e) {
  util.log(util.colors.red('Error'), e.message);
}


/* CSS */

gulp.task('build-css', function() {
  return gulp.src('app/css/**/*.css')
    .on('error', logError)
    .pipe(postcss([
      require('postcss-import')(),
      require('autoprefixer')()
    ]))
    .pipe(gulp.dest('app/build'));
});


gulp.task('watch-css', function () {
  gulp.start(['build-css']);
  gulp.watch('app/css/**/*.css', ['build-css']);
});

gulp.task('build-min-css', ['build-css'], function () {
  return gulp.src(['app/build/*.css', '!app/build/*.min.css'])
    .pipe(postcss([
      require('csswring')()
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/build'));
});


/* JS */

function buildBrowserify(options) {
  var b = browserify({
    entries: 'app/js/' + options.entry,
    debug: true,
    //these properties are needed for watchify
    cache: {},
    packageCache: {}
  });

  var buildBundle = function() {
    return b.bundle()
      .on('error', logError)
      .pipe(source(options.entry))
      .pipe(buffer())
      .pipe(gulp.dest('app/build'));
  };

  if (options.watch) {
    b = watchify(b);
  }

  b.on('update', buildBundle);
  b.transform(babelify.configure({
    optional: ['runtime']
  }));

  return buildBundle();
}

gulp.task('build-js', function () {
  return buildBrowserify({
    entry: 'index.js',
  });
});

gulp.task('watch-js', function () {
  buildBrowserify({
    entry: 'index.js',
    watch: true
  });
});

gulp.task('build-min-js', ['build-js'], function () {
  return gulp.src(['app/build/*.js', '!app/build/*.min.js'])
    .pipe(map(function(data, cb) {
      closurecompiler.compile([data.path], {
        language_in: 'ECMASCRIPT5',
        warning_level: 'QUIET',
      }, function(error, result) {
        data.contents = new Buffer(result);
        cb(null, data);
      });
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/build'));
});


/* HTML */

gulp.task('build-html', function() {
  var context = {'min': false}
  return gulp.src('app/*.ejs')
    .on('error', logError)
    .pipe(ejs(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('app/build'));
});

gulp.task('watch-html', function() {
  gulp.start(['build-html']);
  gulp.watch('app/*.ejs', ['build-html']);
});

gulp.task('build-min-html', function() {
  var context = {'min': true}
  return gulp.src('app/*.ejs')
    .on('error', logError)
    .pipe(ejs(context))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('app/build'));
});

/* Big tasks */

gulp.task('watch', function () {
  gulp.start('watch-css');
  gulp.start('watch-js');
  gulp.start('watch-html');
});

gulp.task('build', ['build-css', 'build-js', 'build-html']);
gulp.task('build-min', ['build-min-css', 'build-min-js', 'build-min-html']);
