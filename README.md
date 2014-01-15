# grunt-ng-constant

> Plugin for dynamic generation of angular constant modules.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ng-constant --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ng-constant');
```

## The "ngconstant" task

### Overview
In your project's Gruntfile, add a section named `ngconstant` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific module configurations.
      // This can be an array if you want to define multiple modules for a single target
      // See the "Multiple Module Option" for further informations.
    },
  },
})
```

### Options

#### options.space
Type: `String`
Default value: `'\t'`

A string that defines how the `JSON.stringify` method will prettify your code. You can get more information in the [MDN Documentation](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify).

#### options.deps
Type: `Array` or `Boolean`
Default value: `[]`

An array that specifies the default dependencies a module should have. When your module should not have any modules, so you can append the constants to an already existing one, you can set `deps` to `false`.

#### options.wrap
Type: `String` or `Boolean`
Default value: `false`
Optional

A boolean to active or deactive the automatic wrapping. A string who will wrap the result of file, use the `<%= __ngModule %>` variable to indicate where to put the generated module content. See the "Custom Wrap Option" section for further informations.

#### options.constants
Type: `Object`
Default value: `{}`
Optional

An object that gets automatically merged in all target `constants` definitions. When you use the multiple module option it gets merged in the first `constants` definition. This option should be used when you need a global `constants` definition for all your targets.

#### options.coffee
Type: `Boolean`
Default value: `false`
Optional

A boolean to toggle coffeescript output instead of javascript, using [`js2coffee`](https://github.com/rstacruz/js2coffee). Can also be assigned on a per-target basis.

#### options.templatePath
Type: `String`
Default value: `constant.tpl.ejs`
Optional

Location of a custom template file for creating the output configuration file. Defaults to the provided constants template file if none provided.

### Usage Examples

#### Default Options
In this example I convert the package.json information in an angular module. So I am able to display e.g. the current version of the application in the app.

```js
grunt.initConfig({
  ngconstant: {
    dist: {
      dest: 'dist/constants.js',
      name: 'constants',
      constants: {
        package: grunt.file.readJSON('package.json')
      }
    }
  },
})
```

#### Default Options, Coffeescript
Same as above example, but outputs coffeescript instead

```js
grunt.initConfig({
  ngconstant: {
    options: {
      coffee: true
    },
    dist: {
      dest: 'dist/constants.coffee',
      name: 'constants',
      constants: {
        package: grunt.file.readJSON('package.json')
      }
    }
  },
})
```

#### Custom Options
In this example we set custom configurations for the `space` and `deps` parameter. So we create a module that has `dep1` and `dep2` as dependency and defines to different constants `constants1` and `constants2` with custom values. The `space` parameter is set to a ` `.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      space: ' ',
      deps: ['dep1', 'dep2']
    },
    dist: {
      dest: 'dist/module.js',
      name: 'someModule',
      constants: {
        'constant1': 'some value you want to set as constant value. This can be of any type that can be transformed via JSON.stringify',
        'constant2': {
          'key1': 'value1',
          'key2': 42
        }
      }
    }
  },
})
```

The resulting module looks like the following:

```
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
      space: ' ',
      deps: ['dep1', 'dep2']
    },
    dist: {
      dest: 'tmp/wrap_options.js',
      name: 'module2',
      deps: ['test'],
      wrap: true,
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
      space: ' ',
      deps: ['dep1', 'dep2']
    },
    dist: {
      dest: 'tmp/wrap_options.js',
      name: 'module2',
      deps: ['test'],
      wrap: 'define( ["angular", "ngResource", "ngCookies"], function() { \n return <%= __ngModule %> \n\n});',
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

```
define( ["angular", "ngResource", "ngCookies"], function() { 
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

If you need the same configuration for all your targets you can use the `constants` option to automatically merge your per target configuration with the global one.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      constants: {
        title: 'grunt-ng-constant',
        debug: false
      }
    },
    dev: {
      name: 'config',
      dest: 'build/config.js',
      constants: {
        debug: true
      }
    },
    prod: {
      name: 'config',
      dest: 'dist/config.js',
      constants: {

      }
    }
  }
});
```

Which results in the following constants objects.

```js
// For your dev target build/config.js
angular.module('config', [])

.constant('title', 'grunt-ng-constant')

.constant('debug', true)

;

// For your prod target dist/config.js
angular.module('config', [])

.constant('title', 'grunt-ng-constant')

.constant('debug', false)

;
```

#### Multiple Module Option

If you want to define multiple modules for a single target at once you wrap your target configuration in an array.

```js
grunt.initConfig({
  ngconstant: {
    dist: [
      {
        dest: 'dist/module1.js',
        name: 'constants1',
        constants: {
          ...
        }
      },
      {
        dest: 'dist/module2.js',
        name: 'constants2',
        constants: {
          ...
        }
      }
    ]
  },
})
```

This will create two files with two different modules.

#### CoffeeScript Module Option

If you want to get coffee script output instead of javascript you can set the `coffee` option to `true`.

```js
grunt.initConfig({
  ngconstant: {
    options: {
      coffee: true // Globally active coffee script generation
    },
    coffee: {
      dest: 'dist/module1.js',
      name: 'constants1',
      constants: {
        ...
      }
    },
    js: {
      coffee: false, // Deactivate it on per module base
      dest: 'dist/module1.js',
      name: 'constants1',
      constants: {
        ...
      }
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

 * v0.4.7 - Closed #17.
 * v0.4.6 - Closed #16. Global constants module option added to README.
 * v0.4.5 - Closed #3, #11. The parameters `space`, `deps`, `wrap` and `coffee` are not available on per module base. Thanks to [jjt](https://github.com/jjt).
 * v0.4.4 - Closed #10
 * v0.4.3 - Single constant option added. ejs dependency removed.
 * v0.4.2 - Wrap option added. Thanks to [gabrielmancini](https://github.com/gabrielmancini).

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/b4bfcf00e0466f3f65e49548850d5d6e "githalytics.com")](http://githalytics.com/werk85/grunt-ng-constant)
