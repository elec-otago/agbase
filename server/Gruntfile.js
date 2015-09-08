/**
 * Grunt File for Server Build
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 **/
module.exports = function ( grunt ) {
  
  /** 
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  
    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-env');
  /**
   * This is the configuration object Grunt uses to give each plugin its 
   * instructions.
   */
  var taskConfig = {
      /**
       * We read in our `package.json` file so we can access the package name and
       * version. It's already there, so we don't repeat ourselves here.
       */
      pkg: grunt.file.readJSON("package.json"),

      apidoc: {
          AgBase: {
              src: "routes/",
              dest: "public/docs/apidoc/"
          }
      },
      env : {
          options: {
              //Shared Options Hash
          },
          test: {
              NODE_TLS_REJECT_UNAUTHORIZED: 0,
              NODE_ENV: 'unit_testing'
          }
      },
      mocha_istanbul: {
          coverage: {
              src: 'test', // a folder works nicely
              options: {
                  mask: '**/*.js'
              }
          }
      }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */

  grunt.registerTask( 'create-docs', [ 'apidoc'] );

  grunt.registerTask( 'test', [ 'env:test','mocha_istanbul:coverage'] );

  /**
   * The default task is to build and compile.
   */

  grunt.registerTask( 'default', [ 'create-docs' ] );

};
