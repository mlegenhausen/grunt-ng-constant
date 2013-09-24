/*
 * grunt-ng-constant
 * https://github.com/werk85/grunt-ng-constant
 *
 * Copyright (c) 2013 werk85
 * Licensed under the MIT license.
 */

'use strict';

var DEFAULT_WRAP = '(function(angular, undefined) {\n\t <%= __ngModule %> \n})(angular);';

module.exports = function (grunt)
{
	grunt.registerMultiTask('ngconstant', 'Dynamic angular constant generator task.', function ()
	{
		var path = require('path');
		var ejs = require('ejs');
		var _ = grunt.util._;

		var options = this.options({
			space: '\t',
			deps: [],
			wrap: false
		});
		var template = grunt.file.read(path.join(__dirname, 'constant.tpl.ejs'));
		var compiler = ejs.compile(template);
		var rawOptions = grunt.config.getRaw(this.name);
		var rawData = grunt.config.getRaw(this.name + '.' + this.target);

		var constants = _.map(this.data.constants, function (value, name)
		{
			return {
				name: name,
				value: JSON.stringify(value, null, options.space)
			};
		});

		// Create the module string
		var result = compiler({
			moduleName: this.data.name,
			deps: this.data.deps || options.deps,
			constants: constants
		});

		// Handle wrapping
		var wrap = rawData.wrap || rawOptions.wrap || '<%= __ngModule %>';
		if (wrap === true)
		{
			wrap = DEFAULT_WRAP;
		}
		result = grunt.template.process(wrap, {
			data: _.extend(grunt.config(), {
				'__ngModule': result
			})
		});

		grunt.log.writeln('Writing ' + this.data.name + ' to ' + this.data.dest);
		grunt.file.write(this.data.dest, result);
		grunt.log.writeln('Created ' + this.data.name);
		grunt.log.ok();
	});
};
