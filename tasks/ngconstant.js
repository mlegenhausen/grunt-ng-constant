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
var toSource = require('tosource');
var beautify = require('js-beautify').js_beautify;
var findup = require('findup-sync');

var MODULE_NAME = 'ngconstant';
var DEFAULT_WRAP = '(function(angular, undefined) {\n\t {%= __ngModule %} \n})(angular);';
var TEMPLATE_PATH = path.join(__dirname, 'constant.tpl.ejs');
var SERIALIZERS = {
  'json': function jsonSerializer(obj) {
    return _.isUndefined(obj) ? 'undefined' : JSON.stringify(obj);
  },
  'source': function sourceSerializer(obj) {
    return toSource(obj);
  }
};

module.exports = function (grunt) {
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
      beautify: {
        indent_with_tabs: true
      },
      jsbeautifyrc: '.jsbeautifyrc',
      serializer: 'json',
      constants: {},
      values: {}
    });

    if(options.jsbeautifyrc) {
      var jsbeautifyrc = findup(options.jsbeautifyrc);
      if(jsbeautifyrc) {
        options.beautify = grunt.file.readJSON(jsbeautifyrc);
      }
    }

    // Merge target configuration in global definition
    _.forEach(['constants', 'values'], function (key) {
      var resolve = _.bind(resolveKey, this, key);
      _.merge(resolve(options), resolve(this.data));
    }, this);

    // Transform the data and create the module string
    var serializer = resolveSerializer(options.serializer);

    var transformData = _.bind(function dataTransformer(data) {
      return _.map(data, function (value, name) {
        return {
          name: name,
          value: serializer.call(this, value, options)
        };
      }, this);
    }, this);

    var result = grunt.template.process(options.template, {
      data: _.extend({}, grunt.config.data, {
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
        data: _.extend({}, grunt.config.data, {
          '__ngModule': result
        }),
        delimiters: options.delimiters
      });
    }

    // Beautify after processing
    if (options.beautify) {
      result = beautify(result, options.beautify);
    }

    // Write the module to disk
    grunt.log.write('Creating module ' + options.name + ' at ' + options.dest + '...');
    grunt.file.write(options.dest, result);
    grunt.log.ok();
  });
};
