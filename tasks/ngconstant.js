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
var js2coffee = require('js2coffee');

var DEFAULT_WRAP = '(function(angular, undefined) {\n\t {%= __ngModule %} \n})(angular);';
var TEMPLATE_PATH = path.join(__dirname, 'constant.tpl.ejs');

module.exports = function (grunt) {
  function toArray(value) {
    return _.isArray(value) ? value : [value];
  }

  function stringify(value, space) {
    return _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
  }

  grunt.template.addDelimiters('ngconstant', '{%', '%}');

  grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function () {
    var options = this.options({
      space: '\t',
      deps: [],
      wrap: '{%= __ngModule %}',
      coffee: false,
      constants: {},
      template: grunt.file.read(TEMPLATE_PATH),
      delimiters: 'ngconstant'
    });

    // Merge global configuration in first module
    var modules = toArray(this.data);
    if (modules.length) {
      modules[0].constants = _.merge(options.constants, modules[0].constants);
    }

    modules.forEach(function (module) {
      // Inherit options from global option definition
      module.options = module.options || {};
      _.defaults(module.options, options);

      // Create compiler data
      var constants = _.map(module.constants, function (value, name) {
        return {
          name: name,
          value: stringify(value, module.options.space)
        };
      });

      // Create the module string
      var result = grunt.template.process(module.options.template, {
        data: _.extend(grunt.config.getRaw(), {
          moduleName: module.name,
          deps: module.options.deps,
          constants: constants
        }),
        delimiters: module.options.delimiters
      });

      // Handle wrapping
      var wrap = module.options.wrap;
      if (wrap === true) {
        wrap = DEFAULT_WRAP;
      }
      if (wrap) {
        result = grunt.template.process(wrap, {
          data: _.extend(grunt.config.getRaw(), {
            '__ngModule': result
          }),
          delimiters: module.options.delimiters
        });
      }

      // Javascript is built, convert to coffeescript
      if (module.options.coffee) {
        result = js2coffee.build(result);
      }

      // Write the module to disk
      grunt.log.write('Creating module ' + module.name + ' at ' + module.dest + '...');
      grunt.file.write(module.dest, result);
      grunt.log.ok();
    });
  });
};
