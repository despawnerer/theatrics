var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');


/* CSS */

gulp.task('build-css', function() {
	return gulp.src('app/css/**/*.css')
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
			.pipe(source(options.entry))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('app/build'));
	};

	if (options.watch) {
		b = watchify(b);
	}

	b.on('update', buildBundle);

	b.transform(babelify, {
		sourceMaps: 'both',
	});

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


/* Big tasks */

gulp.task('watch', function () {
	gulp.start('watch-css');
	gulp.start('watch-js');
});

gulp.task('build', ['build-css', 'build-js']);
