/*
 * grunt-ng-constant
 * https://github.com/werk85/grunt-ng-constant
 *
 * Copyright (c) 2013 werk85
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function() {
    var path = require('path');
    var ejs = require('ejs');
    var _ = grunt.util._;

    var options = this.options({
      space: '\t',
      deps: []
    });
    var template = grunt.file.read(path.join(__dirname, 'constant.tpl.ejs'));
    var compiler = ejs.compile(template);

    _.each(this.data, function(module) {
      var constants = _.map(module.constants, function(value, name) {
        return {
          name: name,
          value: value
        };
      });

      var result = compiler({
        space: options.space || '\t',
        moduleName: module.name,
        deps: module.deps || options.deps,
        constants: constants
      });
      grunt.file.write(module.dest, result);
      grunt.log.writeln('Module ' + module.name + ' created at ' + module.dest);
    });
    grunt.log.ok();
  });
};
