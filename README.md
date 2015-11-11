# grunt-ng-constant [![Build Status](https://travis-ci.org/werk85/grunt-ng-constant.png?branch=master)](https://travis-ci.org/werk85/grunt-ng-constant)

> Plugin for dynamic generation of angular constant and value modules.

## About this Fork
This is a fork of the original [grunt-ng-constant](https://github.com/werk85/grunt-ng-constant). It extends functionality by allowing use of variables in the definition of constants as suggested in this [Stack Overflow discussion](http://stackoverflow.com/questions/18494050/is-there-a-way-in-angularjs-to-define-constants-with-other-constants/26549264#26549264).

## The "ngconstant" task

### Overview
In addition to the existing configurations, the following extention is proposed:

```js
grunt.initConfig({
  ngconstant: {
      var_options: {
        options: {
          dest: 'tmp/var_options.js',
          name: 'module1',
        },
        space: ' ',
        wrap: '{%= __ngModule %};',
        constants: {
          'constant1': {
            vars: {
              var1: 'v1',
              var2: 'v2'
            },
            key1: '"value1"',
            key2: "var1 + 'value2'",
            key3: "var1 + 'value2' + var2",
            key4: "var1 + var2",
            key5: "var2",
            key6: "'value2'"
          },
          'constant2': undefined
        },
        values: {
          'value1': {
            key1: 'value1'
          }
        }
      }
  },
})
```

For the target `build` the resulting file `var_options.js` looks like this:

```js
angular.module("module1", []).constant("constant1", function() {
    var var1 = "v1";
    var var2 = "v2";
    return {
        global_key: "global_value",
        key1: "value1",
        key2: var1 + "value2",
        key3: var1 + "value2" + var2,
        key4: var1 + var2,
        key5: var2,
        key6: "value2"
    };
}()).constant("constant2", undefined).value("value1", {
    key1: "value1"
});
```

As you can see, the constant definitions containing a `vars` object are converted to variable definitions. Their use in defining other constants must be double quoted, i.e. "var1 + 'value2'" translates to var1 + 'value2'.

In addition to the existing configuration, the `grunt-contrib-uglify` has been added to dependencies.

