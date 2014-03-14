# grunt-ng-constant

> Plugin for dynamic generation of angular constant and value modules.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ng-constant --save-dev
```

When the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ng-constant');
```

## The "ngconstant" task

### Overview
The following shows a simple configuration for generating a config module with one constant and one value that contain your package information and debug config.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      name: 'config',
      dest: 'config.js',
      constants: {
        package: grunt.file.readJSON('package.json')
      },
      values: {
        debug: true
      }
    },
    build: {
    }
  },
})
```

For the target `build` the resulting file `config.js` looks like this:

```js
angular.module('config', [])

.constant('package', {
  "version": "0.0.1",
  ...
})

.value("debug", true)

;
```

### Options

#### options.name
Type: `String`
Required

The name of the constant module used in your angular project.

#### options.dest
Type: `String`
Required

The path where the generated constant module should be saved.

#### options.space
Type: `String`
Default value: `'\t'`
Optional

A string that defines how the `JSON.stringify` method will prettify your code. You can get more information in the [MDN Documentation](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify).

#### options.deps
Type: `Array` or `Boolean`
Default value: `[]`
Optional

An array that specifies the default dependencies a module should have. When your module should not have any modules, so you can append the constants to an already existing one, you can set `deps` to `false`.

#### options.wrap
Type: `String` or `Boolean`
Default value: `false`
Optional

A boolean to active or deactive the automatic wrapping. A string who will wrap the result of file, use the `<%= __ngModule %>` variable to indicate where to put the generated module content. See the "Custom Wrap Option" section for further informations.

#### options.constants
Type: `Object`, `String`, `Function`
Default value: `{}`
Optional

If it is an object it gets automatically merged in all target `constants` definitions. This option should be used when you need a global `constants` definition for all your targets.

#### options.values
Type: `Object`, `String`, `Function`
Default value: `{}`
Optional

If it is an object it gets automatically merged in all target `values` definitions. This option should be used when you need a global `values` definition for all your targets.

#### options.template
Type: `String`
Default value: `grunt.file.read('constant.tpl.ejs')`
Optional

Custom template for creating the output constants file. Defaults to the default constants template file if none provided.

#### options.delimiters
Type: `String`
Default value: `ngconstant` which sets the delimiters to `{%` and `%}`. Make sure that you do not use the same delimiters as your grunt configuration or get unwanted behaviour.
Optional



### Usage Examples

#### Default Options
In this example I convert the package.json information in an angular module. So I am able to display e.g. the current version of the application in the app.

```js
grunt.initConfig({
  ngconstant: {
    dist: {
      options: {
        dest: 'dist/constants.js',
        name: 'constants',
      },
      constants: {
        package: grunt.file.readJSON('package.json')
      },
      values: {
        debug: true
      }
    }
  },
})
```

__Note__: In generell for all following examples the applied functionality on `constants` can also be used in for the `values` parameter.

#### Custom Options
In this example we set custom configurations for the `space` and `deps` parameter. So we create a module that has `dep1` and `dep2` as dependency and defines two different constants `constants1` and `constants2` with custom values. The `space` parameter is set to a ` `.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      space: ' ',
      deps: ['dep1', 'dep2'],
      dest: 'dist/module.js',
      name: 'someModule'
    },
    dist: {
      constants: {
        'constant1': 'constant1.json', // Load json from path
        'constant2': {
          'key1': 'value1',
          'key2': 42
        },
        'constant3': function () { // Exec function first on task run
          return 'some lazy return value'
        }
      }
    }
  },
})
```

The resulting module looks like the following:

```js
angular.module("someModule", ["dep1", "dep2"])

.constant("constant1", "some value you want to set as constant value.
  This can be of any type that can be transformed via JSON.stringify")

.constant("constant2", {
  "key1": "value1",
  "key2": 42
})

;
```

#### Wrap Option

The `wrap` option allows you to encapsulate the module in a closure. Simply set `wrap` to `true`.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      dest: 'tmp/wrap_options.js',
      name: 'module2',
      wrap: true
    },
    dist: {
      constants: {
        'constant1': {
          key1: 123,
          key2: 'value2',
          foobar: false
        }
      }
      
    },
    nowrap: { 
      options: {
        wrap: false // Disable wrapping for the 'nowrap' target
      },
      constants: {
        ...
      }
    }
  },
})
```

The resulting module looks like:

```js
(function(angular, undefined) {
   angular.module("module2", ["test"])

.constant("constant1", {
  "key1": 123,
  "key2": "value2",
  "foobar": false
})

; 
})(angular);
```

#### Custom Wrap Option

If you want to use another wrapping you can use a string as `wrap` option, which is interpolated by the plugin. Use the `__ngModule` variable as placeholder for the generated module.

Here a RequireJS example:

```js
grunt.initConfig({
  ngconstant: {
    options: {
      dest: 'tmp/wrap_options.js',
      name: 'module2',
      wrap: 'define(["angular", "ngResource", "ngCookies"], function() { \n return {%= __ngModule %} \n\n});',
    },
    dist: {
      constants: {
        'constant1': {
          key1: 123,
          key2: 'value2',
          foobar: false
        }
      }
    }
  },
})
```

The resulting module looks like the following:

```js
define(["angular", "ngResource", "ngCookies"], function() { 
 return angular.module("module2", ["test"])

.constant("constant1", {
  "key1": 123,
  "key2": "value2",
  "foobar": false
})

; 

});
```

__Note__: For longer wrapping templates it is recommended to use `grunt.file.read('customer-wrap.tpl.ejs')`.

#### Global Constants option

If you need the same configuration for all your targets you can use the `constants` option to automatically merge your per target configuration with the global one. If you want don't want to merge, you can use the per target `constants` option to override everything.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      name: 'config',
      dest: 'config.js',
      constants: {
        title: 'grunt-ng-constant',
        debug: true
      }
    },
    dev: {
      constants: {
        title: 'grunt-ng-constant-beta'
      }
    },
    prod: {
      constants: {
        debug: false
      }
    },
    override_global: {
      options: {
        constants: { // This does not merge it overrides
          ...
        }
      }
    }
  }
});
```

Which results in the following constants objects.

For the target `dev`:

```js
angular.module('config', [])

.constant('title', 'grunt-ng-constant-beta')

.constant('debug', true)

;
```

For the target `prod`:

```js
angular.module('config', [])

.constant('title', 'grunt-ng-constant')

.constant('debug', false)

;
```

## FAQ

#### How can I change the quote style?
You can create your own template that escapes all `"`, but this is not a generell solution. Currently there is no easy way to change this. If you know a converter that can print out pure javascript instead of JSON, please tell me.

#### How can I create multiple modules?
Create for each module an own target and set the `dest`, `name` and `constants` parameter for each one.

#### How can I create a CoffeeScript version of the module
Till v0.5.0 this was supported natively by the plugin. Now you have to use the [grunt-js2coffee](https://github.com/jonschlinkert/grunt-js2coffee) plugin.

#### Hey I like this project how can I help?
Report bugs, propose new features or simply star the project that shows me that are people are interessted in this project.

## Upgrade from v0.4.x to v0.5.x

 * `dest` and `name` need to be placed under the `options` parameter.
 * Multimodule configuration has been removed to make the configuration more simple. If you need this in your project split your module array in multiple targets and define for each target the `dest` and `name` option.

## Release History
 * v0.5.0 - Completely reworked configuration. Not backwards compatible. Closed [#12](https://github.com/werk85/grunt-ng-constant/issues/12).
 * v0.4.8 - Closed [#19](https://github.com/werk85/grunt-ng-constant/issues/19), [#23](https://github.com/werk85/grunt-ng-constant/issues/23). Thanks to [dropshare](https://github.com/dropshape) and [ggalmazor](https://github.com/ggalmazor).
 * v0.4.7 - Closed [#17](https://github.com/werk85/grunt-ng-constant/issues/17).
 * v0.4.6 - Closed [#16](https://github.com/werk85/grunt-ng-constant/issues/16). Global constants module option added to README.
 * v0.4.5 - Closed [#3](https://github.com/werk85/grunt-ng-constant/issues/3), [#11](https://github.com/werk85/grunt-ng-constant/issues/11). The parameters `space`, `deps`, `wrap` and `coffee` are not available on per module base. Thanks to [jjt](https://github.com/jjt).
 * v0.4.4 - Closed [#10](https://github.com/werk85/grunt-ng-constant/issues/10)
 * v0.4.3 - Single constant option added. ejs dependency removed.
 * v0.4.2 - Wrap option added. Thanks to [gabrielmancini](https://github.com/gabrielmancini).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/b4bfcf00e0466f3f65e49548850d5d6e "githalytics.com")](http://githalytics.com/werk85/grunt-ng-constant)
