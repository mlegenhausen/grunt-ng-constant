/*
 * grunt-ng-constant
 * https://github.com/werk85/grunt-ng-constant
 *
 * Copyright (c) 2014 werk85
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var _ = require('lodash');
var jju = require('jju');
var toSource = require('tosource');

var MODULE_NAME = 'ngconstant';
var DEFAULT_WRAP = '(function(angular, undefined) {\n\'use strict\';\n\n{%= __ngModule %}\n})(angular);';
var TEMPLATE_PATH = path.join(__dirname, 'constant.tpl.ejs');
var SERIALIZERS = {
  'jju': function jjuSerializer(obj, serializerOptions) {
    return _.isUndefined(obj) ? 'undefined' : jju.stringify(obj, serializerOptions);
  },
  'json': function jsonSerializer(obj, serializerOptions) {
    return _.isUndefined(obj) ? 'undefined' : JSON.stringify(obj, serializerOptions.replacer, serializerOptions.space);
  },
  'source': function sourceSerializer(obj, serializerOptions) {
    return toSource(obj, serializerOptions.filter, serializerOptions.indent, serializerOptions.startingIndent);
  }
};

module.exports = function (grunt) {
  function requiredOptions(options, properties) {
    var pluralize = grunt.util.pluralize;
    var missing = properties.filter(function (key) {
      return !options[key];
    });

    if (!_.isEmpty(missing)) {
      throw grunt.util.error('Required option propert' + pluralize(missing.length, 'y/ies') + ' ' + missing.join(', ') + ' is missing');
    }
  }

  function resolveKey(key, obj) {
    obj[key] = _.result(obj, key) || {};
    if (_.isString(obj[key])) {
      obj[key] = grunt.file.readJSON(obj[key]);
    }
    if (!_.isObject(obj[key])) {
      grunt.fail.warn('Parameter ' + key + ' needs to be of type object');
    }
    return obj[key];
  }

  function resolveSerializer(key) {
    var serializer = SERIALIZERS[key] || key;
    if (!_.isFunction(serializer)) {
      grunt.fail.warn('Invalid serializer. Serializer needs to be a function.');
    }
    return serializer;
  }

  var defaultTemplate = grunt.file.read(TEMPLATE_PATH);
  // Add delimiters that do not conflict with grunt
  grunt.template.addDelimiters(MODULE_NAME, '{%', '%}');

  grunt.registerMultiTask(MODULE_NAME, 'Dynamic angular constant generator task.', function () {
    var options = this.options({
      deps: [],
      wrap: '{%= __ngModule %}',
      template: defaultTemplate,
      delimiters: MODULE_NAME,
      serializer: 'jju',
      serializerOptions: {
        indent: '',
        no_trailing_comma: true
      },
      constants: {},
      values: {}
    });

    // Check if name and dest are givein in the options
    requiredOptions(options, ['name', 'dest']);

    // Merge target configuration in global definition
    _.forEach(['constants', 'values'], function (key) {
      var resolve = _.bind(resolveKey, this, key);
      _.merge(resolve(options), resolve(this.data));
    }, this);

    // Transform the data and create the module string
    var serializer = resolveSerializer(options.serializer);

    var transformData = function dataTransformer(data) {
      return _.map(data, function (value, name) {
        return {
          name: name,
          value: serializer.call(this, value, options.serializerOptions, options)
        };
      }, this);
    }.bind(this);

    var result = grunt.template.process(options.template, {
      data: _.extend({}, grunt.config.get('data'), {
        moduleName: options.name,
        deps: options.deps,
        constants: transformData(options.constants),
        values: transformData(options.values)
      }),
      delimiters: options.delimiters
    });

    // Handle wrapping
    if (options.wrap) {
      if (options.wrap === true) {
        options.wrap = DEFAULT_WRAP;
      }
      result = grunt.template.process(options.wrap, {
        data: _.extend({}, grunt.config.get('data'), {
          '__ngModule': result
        }),
        delimiters: options.delimiters
      });
    }

    // Write the module to disk
    grunt.log.write('Creating module ' + options.name + ' at ' + options.dest + '...');
    grunt.file.write(options.dest, result);
    grunt.log.ok();
  });
};
