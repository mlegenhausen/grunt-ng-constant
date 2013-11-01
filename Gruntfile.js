/*
 * grunt-ng-constant
 * https://github.com/mlegenhausen/grunt-ng-constant
 *
 * Copyright (c) 2013 Malte Legenhausen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    ngconstant: {
      options: {
        space: '\t',
        constants: {
          'constant1': {
            global_key: 'global_value'
          }
        }
      },
      default_options: [
        {
          dest: 'tmp/default_options.js',
          name: 'module1',
          constants: {
            'constant1': {
              key1: 'value1',
              key2: 'value2'
            },
            'constant2': undefined
          }
        }
      ],
      custom_options: [
        {
          dest: 'tmp/custom_options.js',
          name: 'module2',
          deps: ['test'],
          constants: {
            'constant1': {
              key1: 123,
              key2: 'value2',
              foobar: false
            }
          }
        }
      ],
      wrap_options: [
        {
          dest: 'tmp/wrap_options.js',
          name: 'module2',
          deps: ['test'],
          wrap: true,
          constants: {
            'constant1': {
              key1: 123,
              key2: 'value2',
              foobar: false
            }
          }
        }
      ],
      custom_wrap_options: [
        {
          dest: 'tmp/custom_wrap_options.js',
          name: 'module2',
          deps: ['test'],
          wrap: 'define( ["angular", "ngResource", "ngCookies"], function() { \n return <%= __ngModule %> \n\n});',
          constants: {
            'constant1': {
              key1: 123,
              key2: 'value2',
              foobar: false
            }
          }
        }
      ],
      simple_default_options: {
        dest: 'tmp/simple_default_options.js',
        name: 'module1',
        constants: {
          'constant1': {
            key1: 'value1',
            key2: 'value2'
          },
          'constant2': undefined
        }
      },
      coffee_options: [
        {
          dest: 'tmp/coffee_options.coffee',
          name: 'module1',
          coffee: true,
          constants: {
            'constant1': {
              key1: 'value1',
              key2: 'value2'
            },
            'constant2': undefined
          }
        }
      ]
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

    bump: {
      options: {
        pushTo: 'origin'
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-bump');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'ngconstant', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
