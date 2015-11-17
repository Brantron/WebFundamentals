'use strict';

var del = require('del');
var minimist = require('minimist');
var chalk = require('chalk');

var knownOptions = {
  string: ['lang', 'section'],
  default: {
    lang: null,
    section: null
  }
};

GLOBAL.WF = {
  gae: 'appengine-config',
  src: {
    content: 'src/content',
    jekyll: 'src/jekyll',
    jekyllConfigs: 'src/jekyll/_config',
    imgs: 'src/static/imgs',
    styles: 'src/static/styles',
    fonts: 'src/static/fonts',
    scripts: 'src/static/scripts',
    thirdParty: 'src/static/third_party'
  },
  build: {
    root: 'build',
    jekyll: 'build/langs',
    imgs: 'build/imgs',
    styles: 'build/styles',
    fonts: 'build/fonts',
    scripts: 'build/scripts'
  }
};
GLOBAL.WF.options = minimist(process.argv.slice(2), knownOptions);
console.log('---------------------------------');
console.log('');
console.log(chalk.magenta('STOP - this branch is now closed.'));
console.log('');
console.log('Please use the ' + chalk.cyan('master') + ' branch instead.');
console.log('');
console.log('---------------------------------');
console.log('');
if (GLOBAL.WF.options.lang === null) {
  console.log(chalk.dim('    Building all languages.'));
  console.log(chalk.white('    Add ') +
    chalk.magenta('--lang <Language Code>') +
    chalk.white(' to build a specific language.'));
} else {
  console.log(chalk.dim('    Building language: ') +
    chalk.white(GLOBAL.WF.options.lang));
}
console.log('');
if (GLOBAL.WF.options.section === null) {
  console.log(chalk.dim('    Building all sections.'));
  console.log(chalk.white('    Add ') +
    chalk.magenta('--section <Section Folder Name>') +
    chalk.white(' to build a specific section.'));
} else {
  console.log(chalk.dim('    Building section: ') +
    chalk.white(GLOBAL.WF.options.section));
}
console.log('');
console.log('---------------------------------');
console.log('');

var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');

requireDir('./gulp-tasks');

gulp.task('clean', del.bind(null,
  [
    GLOBAL.WF.build.root
  ], {dot: true}));

gulp.task('removeIndexPage', del.bind(null,
  [GLOBAL.WF.build.jekyll + '/*/index.html']));

gulp.task('develop', function(cb) {
  runSequence(
    'clean',
    [
      'generate-dev-css',
      'cp-images',
      'cp-fonts',
      'cp-scripts',
    ],
    'compile-jekyll:localhost',
    'start-gae-dev-server',
    'dev-watch-tasks',
    cb);
});

gulp.task('develop:prod', function(cb) {
  runSequence(
    'clean',
    'tests',
    [
      'generate-prod-css',
      'minify-images',
      'cp-fonts',
      'cp-scripts',
    ],
    'compile-jekyll:localhost',
    [
      'html',
      'minify-images:content'
    ],
    'start-gae-dev-server',
    'prod-watch-tasks',
    cb);
});

gulp.task('build:staging', function(cb) {
  runSequence(
    'clean',
    'tests',
    [
      'generate-prod-css',
      'minify-images',
      'cp-fonts',
      'cp-scripts',
      'copy-appengine-config'
    ],
    'compile-jekyll:staging',
    [
      'html',
      'minify-images:content'
    ],
    cb);
});

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    'tests',
    [
      'generate-prod-css',
      'minify-images',
      'cp-fonts',
      'copy-appengine-config'
    ],
    'compile-jekyll:devsite',
    [
      'html',
      'minify-images:content'
    ],
    'removeIndexPage',
    cb);
});

/**
 * By default we'll kick of the development
 * build of WF
 **/
gulp.task('default', ['develop']);
