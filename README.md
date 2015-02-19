# grunt-ng-constant [![Build Status](https://travis-ci.org/werk85/grunt-ng-constant.png?branch=master)](https://travis-ci.org/werk85/grunt-ng-constant)

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

#### options.deps
Type: `Array` or `Boolean`
Default value: `[]`
Optional

An array that specifies the default dependencies a module should have. When your module should not have any modules, so you can append the constants to an already existing one, you can set `deps` to `false`.

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

#### options.wrap
Type: `String` or `Boolean`
Default value: `false`
Optional

A boolean to activate or deactivate the automatic wrapping. A string which will wrap the result of file, use the `{%= __ngModule %}` variable to indicate where to put the generated module content. See the "Custom Wrap Option" section for further informations.

#### options.serializer
Type: `String|Function`
Default value: `jju`
Optional

Available options:

 * `jju` (Default) Uses the [jju](https://github.com/rlidwka/jju) stringify method.
 * `json` Uses `JSON.stringify` for serialization.
 * `tosource` Use the [node-tosource](https://github.com/marcello3d/node-tosource) module.

If you want to define your own serializer use `function(obj, serializerOptions, options) { return /* your serialized string */ }`. `this` will be set to the plugin context.

#### options.serializerOptions
Type: `Object`
Default value: `{indent: '', no_trailing_comma: true}`
Optional

Use this option for setting specific options for the given serializer. The default config configures the [jju](https://github.com/rlidwka/jju) stringify method. See the documentation for more information of possible options.

#### options.template
Type: `String`
Default value: `grunt.file.read('constant.tpl.ejs')`
Optional

Custom template for creating the output constants file. Defaults to the default constants template file if none provided.

#### options.delimiters
Type: `String`
Default value: `ngconstant` which sets the template delimiters to `{%` and `%}`. Make sure that you do not use the same delimiters as your grunt configuration or get unwanted behaviour.
Optional


### Usage Examples

#### Default Options
In this example I convert the package.json information to an angular module. So I am able to display such things as the current version of the application in the app.

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

__Note__: In most cases for all following examples the applied functionality on `constants` can also be achieved with the `values` parameter.

#### Custom Options
In this example we set custom configurations for the `space` and `deps` parameters. So we create a module that has `dep1` and `dep2` as dependencies and defines two different constants `constants1` and `constants2` with custom values. The `space` parameter is set to a ` `.

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
        'constant1': {
          'key1': 'value1',
          'key2': 42
        },
        'constant2': 'value2'
      }
    }
  },
})
```

The resulting module looks like the following:

```js
angular.module("someModule", ["dep1", "dep2"])

.constant("constant1", {
  "key1": "value1",
  "key2": 42
})

.constant("constant2", "value2")

;
```

You can also load the constants definition directly from a file:

```js
grunt.initConfig({
  ngconstant: {
    options: {
      dest: 'dist/module.js',
      name: 'someModule'
    },
    dist: {
      constants: 'constants.json'
    }
  },
})
```

Or if you want to calculate the constants value at runtime you can create a lazy evaluated method which should be used if you generate your json file during the build process.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      dest: 'dist/module.js',
      name: 'someModule'
    },
    dist: {
      constants: function () {
        return {
          lazyConfig: grunt.file.readJSON('build/lazy-config.json')
        };
      }
    }
  },
})
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

If you need the same configuration for all your targets you can use the `constants` option to automatically merge your per target configuration into the global one. If you don't want to merge, you can use the per target `constants` option to override everything.

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

#### How can I change the style of the generated code?
If the code looks to ugly for you. You can use [grunt-jsbeautifyer](https://github.com/vkadam/grunt-jsbeautifier).

#### How can I create multiple modules?
Create a custom target for each module and set the `dest`, `name`, `constants` and `values` parameter for each one.

#### How can I create a CoffeeScript version of the module
Till v1.0.0 this was supported natively by the plugin. Now you have to use the [grunt-js2coffee](https://github.com/jonschlinkert/grunt-js2coffee) plugin.

#### Hey I like this project how can I help?
Report bugs, propose new features or simply star the project that shows me that are people are interessted in this project.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/b4bfcf00e0466f3f65e49548850d5d6e "githalytics.com")](http://githalytics.com/werk85/grunt-ng-constant)
