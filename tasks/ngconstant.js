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

    // Pick all option variables which are available per module
    var defaultModuleOptions = _.pick(options, ['space', 'deps', 'wrap', 'coffee', 'delimiters', 'template']);

    // Merge global configuration in first module
    var modules = toArray(this.data);
    if (modules.length) {
      modules[0].constants = _.merge(options.constants, modules[0].constants);
    }

    modules.forEach(function (module, index) {
      // Merge per module options with default options
      _.defaults(module, defaultModuleOptions);

      // Create compiler data
      var constants = _.map(module.constants, function (value, name) {
        return {
          name: name,
          value: stringify(value, module.space)
        };
      });

      // Create the module string
      var result = grunt.template.process(module.template, {
        data: _.extend(grunt.config.getRaw(), {
          moduleName: module.name,
          deps: module.deps,
          constants: constants
        }),
        delimiters: module.delimiters
      });

      // Handle wrapping
      if (module.wrap === true) {
        module.wrap = DEFAULT_WRAP;
      }
      result = grunt.template.process(module.wrap, {
        data: _.extend(grunt.config.getRaw(), {
          '__ngModule': result
        }),
        delimiters: module.delimiters
      });

      // Javascript is built, convert to coffeescript
      if (module.coffee) {
        result = js2coffee.build(result);
      }

      // Write the module to disk
      grunt.log.write('Creating module ' + module.name + ' at ' + module.dest + '...');
      grunt.file.write(module.dest, result);
      grunt.log.ok();
    });
  });
};
