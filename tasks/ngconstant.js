/*
 * grunt-ng-constant
 * https://github.com/werk85/grunt-ng-constant
 *
 * Copyright (c) 2013 werk85
 * Licensed under the MIT license.
 */

'use strict';

var DEFAULT_WRAP = '(function(angular, undefined) {\n\t <%= __ngModule %> \n})(angular);';

module.exports = function (grunt) {
  var _ = grunt.util._;

  function toArray(value) {
    return _.isArray(value) ? value : [value];
  }

  grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function () {
    var path = require('path');
    var ejs = require('ejs');

    var options = this.options({
      space: '\t',
      deps: [],
      wrap: false
    });
    var template = grunt.file.read(path.join(__dirname, 'constant.tpl.ejs'));
    var compiler = ejs.compile(template);
    var rawOptions = grunt.config.getRaw(this.name);
    var rawData = toArray(grunt.config.getRaw(this.name + '.' + this.target));

    toArray(this.data).forEach(function (module, index) {
      var constants = _.map(module.constants, function (value, name) {
        return {
          name: name,
          value: JSON.stringify(value, null, options.space)
        };
      });

      // Create the module string
      var result = compiler({
        moduleName: module.name,
        deps: module.deps || options.deps,
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

      grunt.file.write(module.dest, result);
      grunt.log.writeln('Module ' + module.name + ' created at ' + module.dest);
    });
    grunt.log.ok();
  });
};
