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

  function stringify(value, space, singlequote) {
    var str = _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
    if (singlequote) {
      str = str.replace(/"/g, '\'');
    }
    return str;
  }

  grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function () {
    var options = this.options({
      space: '\t',
      deps: [],
      singlequote: false,
      wrap: false,
      coffee: false,
      constants: {}
    });
    // Pick all option variables which are available per module
    var defaultModuleOptions = _.pick(options, ['space', 'deps', 'singlequote', 'wrap', 'coffee']);
    var template = grunt.file.read(TEMPLATE_PATH);
    var compiler = _.template(template);
    var modules = toArray(this.data);

    // Get raw configurations for manuell wrap option interpolation
    var rawConfig = grunt.config.getRaw(this.name);
    var rawOptions = rawConfig && rawConfig.options || {};
    var rawData = toArray(rawConfig[this.target]);

    // Merge global configuration in first module
    if (modules.length) {
      modules[0].constants = _.merge(options.constants, modules[0].constants);
    }

    modules.forEach(function (module, index) {
      _.defaults(module, defaultModuleOptions);

      var constants = _.map(module.constants, function (value, name) {
        return {
          name: name,
          value: stringify(value, module.space, module.singlequote)
        };
      });

      // Create the module string
      var result = compiler({
        moduleName: module.name,
        deps: module.deps,
        singlequote: module.singlequote,
        constants: constants
      });

      // Handle wrapping
      var wrap = rawData[index].wrap || rawOptions.wrap || '<%= __ngModule %>';
      if (wrap === true) {
        wrap = DEFAULT_WRAP;
      }
      result = grunt.template.process(wrap, {
        data: _.extend(grunt.config(), {
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
