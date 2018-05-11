const gulp = require('gulp'),
      pug = require('gulp-pug'),
      sass = require('gulp-sass'),
      rename = require('gulp-rename'),
      sourcemaps = require('gulp-sourcemaps'),
      del = require('del'),
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync').create(),
      imagemin = require('gulp-imagemin'),
      imageminJpegRecompress = require('imagemin-jpeg-recompress'),
      pngquant = require('imagemin-pngquant'),
      cache = require('gulp-cache');

const paths = {
  root: './build',
  templates: {
    pages: 'src/templates/pages/*.pug',
    src: 'src/templates/**/*.pug',
    dest: 'build/assest'
  },
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'build/assets/styles/',
    app: './src/styles/main.scss'
  },
  images: {
    src: 'src/images/**/',
    dest: 'build/assets/images/'
  },
  fonts: {
    src: 'src/fonts/*.*',
    build: 'build/assets/fonts'
  }
}

function watch() {
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.templates.src, templates)
  gulp.watch(paths.images.src, pic)
  gulp.watch(paths.fonts.src, fonts)
}

function server() {
  browserSync.init({
    server: paths.root
  });
  browserSync.watch(paths.root + '/**/*.*', browserSync.reload)
}

function clean() {
  return del(paths.root)
}

function templates() {
  return gulp.src(paths.templates.pages)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.root))
}

function styles() {
  return gulp.src(paths.styles.app)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(gulp.dest(paths.styles.dest))
}

function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.build))
}

function pic() {
  return gulp.src('src/images/**/*.*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality:'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: '65-70', speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest('build/assets/images'));
};

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.fonts = fonts;
exports.imagemin = imagemin;
exports.imageminJpegRecompress = imageminJpegRecompress;
exports.pngquant = pngquant;
exports.cache = cache;
exports.pic = pic;

gulp.task('start', 
  gulp.series(
    clean,
    gulp.parallel(
      styles, templates, fonts, pic
    ),
    gulp.parallel(
      watch, server
    )
))