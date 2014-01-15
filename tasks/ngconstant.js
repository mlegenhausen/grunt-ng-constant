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

var DEFAULT_WRAP = '(function(angular, undefined) {\n\t <%= __ngModule %> \n})(angular);';
var TEMPLATE_PATH = path.join(__dirname, 'constant.tpl.ejs');

module.exports = function (grunt) {
  function toArray(value) {
    return _.isArray(value) ? value : [value];
  }

  function stringify(value, space) {
    return _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
  }

  grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function () {
    var options = this.options({
      space: '\t',
      deps: [],
      wrap: false,
      coffee: false,
      constants: {},
      templatePath: TEMPLATE_PATH
    });

    // Pick all option variables which are available per module
    var defaultModuleOptions = _.pick(options, ['space', 'deps', 'wrap', 'coffee', 'templatePath']);

    // Get raw configurations for manuell wrap option interpolation
    var rawConfig = grunt.config.getRaw(this.name);
    var rawOptions = rawConfig && rawConfig.options || {};
    var rawData = toArray(rawConfig[this.target]);

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
      var template = grunt.file.read(module.templatePath);
      var result = _.template(template, {
        moduleName: module.name,
        deps: module.deps,
        constants: constants
      });

      // Handle wrapping
      var wrap = rawData[index].wrap || rawOptions.wrap || '<%= __ngModule %>';
      if (wrap === true) {
        wrap = DEFAULT_WRAP;
      }
      result = grunt.template.process(wrap, {
        data: _.extend(grunt.config.getRaw(), {
          '__ngModule': result
        })
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
