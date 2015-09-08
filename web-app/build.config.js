/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
    jsunit: [ 'src/**/*.spec.js' ],
    
    coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],
    coffeeunit: [ 'src/**/*.spec.coffee' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    less: ['src/less/main.less', 'vendor/font-awesome/less/font-awesome.less']
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
Done, without errors.

   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [    
    'vendor/angular/angular.js',
    'vendor/angular-mocks/angular-mocks.js', //MDB for some reason the test files arent being copied
    'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
      'vendor/angular-bootstrap/ui-bootstrap.min.js',
    'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'vendor/angular-ui-router/release/angular-ui-router.js',
    'vendor/angular-ui-utils/modules/route/route.js',
    'vendor/jquery/dist/jquery.min.js',
    'vendor/bootstrap/dist/js/bootstrap.min.js',
    'vendor/metisMenu/dist/metisMenu.min.js',
    'vendor/angular-flot/angular-flot.js',
    'vendor/flot/jquery.flot.js',
    'vendor/flot/jquery.flot.resize.js',
    'vendor/flot/jquery.flot.time.js',
    'vendor/flot/jquery.flot.errorbars.js',
    'vendor/flot.orderbars/js/jquery.flot.orderBars.js',
    'vendor/lodash/dist/lodash.min.js',
    'vendor/angular-loading-bar/build/loading-bar.min.js',
    'vendor/angular-google-maps/dist/angular-google-maps.min.js',
    'vendor/ng-table/dist/ng-table.min.js',
    'vendor/angular-sanitize/angular-sanitize.min.js',
    'vendor/ng-csv/build/ng-csv.min.js',
    'vendor/moment/moment.js',
    'vendor/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
    'vendor/JSZip/jszip.min.js',
    'src/assets/js/ShapeFileMaker/ShapeFileMaker.js',      
    'src/assets/js/ShapeFileMaker/ShapeFileMakerGeoJSON.js',
    'vendor/flot-axislabels-master/jquery.flot.axislabels.js'
    ],
    js_map: [
        'vendor/jquery/dist/jquery.min.map'
    ],
    css: [
      'vendor/bootstrap/dist/css/bootstrap.min.css',
      'vendor/metisMenu/dist/metisMenu.min.css',
      'vendor/angular-loading-bar/build/loading-bar.css',
      'vendor/ng-table/dist/ng-table.min.css',
      'vendor/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
      'vendor/font-awesome/css/font-awesome.min.css'
    ],
    assets: [
      'src/assets/**/*.js',
//       'vendor/font-awesome/fonts/FontAwesome.otf',
//       'vendor/font-awesome/fonts/fontawesome-webfont.eot',
//       'vendor/font-awesome/fonts/fontawesome-webfont.svg',
//       'vendor/font-awesome/fonts/fontawesome-webfont.ttf',
//       'vendor/font-awesome/fonts/fontawesome-webfont.woff',
//       'vendor/font-awesome/fonts/fontawesome-webfont.woff2',
      'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
      'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
      'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
      'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
      'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2'
    ]
  }
};
