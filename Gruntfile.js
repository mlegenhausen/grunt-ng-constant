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
        dest: 'tmp/empty_options.js',
        space: '\t',
        wrap: '{%= __ngModule %};',
        constants: function () {
          return {
            'constant1': {
              global_key: 'global_value'
            }
          };
        }
      },
      default_options: {
        options: {
          dest: 'tmp/default_options.js',
          name: 'module1',
        },
        constants: {
          'constant1': {
            key1: 'value1',
            key2: 'value2'
          },
          'constant2': undefined
        },
        values: {
          'value1': {
            key1: 'value1'
          }
        }
      },
      no_deps_options: {
        options: {
          deps: false,
          name: 'module1',
          dest: 'tmp/no_deps_options.js'
        }
      },
      custom_options: {
        options: {
          deps: ['test1', 'test2'],
          dest: 'tmp/custom_options.js',
          name: 'module2'
        },
        constants: {
          'constant1': {
            key1: 123,
            key2: 'value2',
            foobar: false
          }
        }
      },
      wrap_options: {
        options: {
          deps: ['test'],
          wrap: true,
          dest: 'tmp/wrap_options.js',
          name: 'module2'
        },
        constants: {
          'constant1': {
            key1: 123,
            key2: 'value2',
            foobar: false
          }
        }
      },
      custom_wrap_options: {
        options: {
          deps: ['test'],
          wrap: 'define(["angular", "ngResource", "ngCookies"], function() {\nreturn {%= __ngModule %}\n\n});',
          dest: 'tmp/custom_wrap_options.js',
          name: 'module2'
        },
        constants: {
          'constant1': {
            key1: 123,
            key2: 'value2',
            foobar: false
          }
        }
      },
      global_constants_options: {
        options: {
          dest: 'tmp/global_constants_options.js',
          name: 'module1'
        },
        constants: {
          'constant1': {
            global_key: 'overriden_global_value'
          }
        }
      },
      template_options: {
        options: {
          template: grunt.file.read('test/custom.tpl.ejs'),
          dest: 'tmp/template_options.js',
          name: 'templateOptionsModule',
        },
        constants: {
          'constant1': 'value1'
        }
      },
      string_constants_options: {
        options: {
          dest: 'tmp/string_constants_options.js',
          name: 'stringConstantsOptionsModule'
        },
        constants: 'test/constants.json'
      },
      source_serializer_options: {
        options: {
          dest: 'tmp/source_serializer_options.js',
          name: 'sourceConstant',
          serializer: 'source',
        },
        constants: {
          constant1: [ 4, 5, 6, 'hello', {
              a:2,
              'b':3,
              '1':4,
              'if':5,
              yes:true,
              no:false,
              nan:NaN,
              infinity:Infinity,
              'undefined':undefined,
              'null':null,
              foo: function(bar) {

              }
          },
          /we$/gi,
          new Date("Wed, 09 Aug 1995 00:00:00 GMT")]
        }
      }
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
