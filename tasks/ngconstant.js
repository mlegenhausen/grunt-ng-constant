/*
 * grunt-ng-constant
 * https://github.com/werk85/grunt-ng-constant
 *
 * Copyright (c) 2013 werk85
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var _ = require('lodash');

var MODULE_NAME = 'ngconstant';
var DEFAULT_WRAP = '(function(angular, undefined) {\n\t {%= __ngModule %} \n})(angular);';
var TEMPLATE_PATH = path.join(__dirname, 'constant.tpl.ejs');

module.exports = function (grunt) {
  function stringify(value, space) {
    return _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
  }

  var defaultTemplate = grunt.file.read(TEMPLATE_PATH);

  // Add delimiters that do not conflict with grunt
  grunt.template.addDelimiters(MODULE_NAME, '{%', '%}');

  grunt.registerMultiTask(MODULE_NAME, 'Dynamic angular constant generator task.', function () {
    var options = this.options({
      space: '\t',
      deps: [],
      wrap: '{%= __ngModule %}',
      coffee: false,
      template: defaultTemplate,
      delimiters: MODULE_NAME,
      constants: {}
    });

    // Merge target configuration in global definition
    _.merge(options.constants, _.pick(this.data, function (value, key) {
      return key !== 'options';
    }));

    // Create compiler data
    var constants = _.map(options.constants, function (value, name) {
      return {
        name: name,
        value: stringify(value, options.space)
      };
    });

    // Create the module string
    var result = grunt.template.process(options.template, {
      data: _.extend({}, grunt.config.data, {
        moduleName: options.name,
        deps: options.deps,
        constants: constants
      }),
      delimiters: options.delimiters
    });

    // Handle wrapping
    if (options.wrap) {
      if (options.wrap === true) {
        options.wrap = DEFAULT_WRAP;
      }
      result = grunt.template.process(options.wrap, {
        data: _.extend({}, grunt.config.data, {
          '__ngModule': result
        }),
        delimiters: options.delimiters
      });
    }

    // Javascript is built, convert to coffeescript
    if (options.coffee) {
      result = require('js2coffee').build(result);
    }

    // Write the module to disk
    grunt.log.write('Creating module ' + options.name + ' at ' + options.dest + '...');
    grunt.file.write(options.dest, result);
    grunt.log.ok();
  });
};
