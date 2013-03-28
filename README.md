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
  ng_constant: {
    options: {
      // Task-specific options go here.
    },
    your_target: [
      // Target-specific module configurations.
    ],
  },
})
```

### Options

#### options.space
Type: `String`
Default value: `'\t'`

A string that defines how the `JSON.stringify` method will prettify your code. You can get more information in the (MDN Documentation)[https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify].

#### options.deps
Type: `Array` or `Boolean`
Default value: `[]`

An array that specifies the default dependencies a module should have. When your module should not have any modules, so you can append the constants to an already existing one, you can set `deps` to `false`.


### Usage Examples

#### Default Options
In this example I convert the package.json information in an angular module. So I am able to display e.g. the current version of the application in the app.

```js
grunt.initConfig({
  ngconstant: {
    dist: [
      {
        dest: 'dist/constants.js',
        name: 'constants',
        constants: {
          package: grunt.file.readJSON('package.json')
        }
      }
    ]
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
    dist: [
      {
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
    ]
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
