# logfile-grunt

[![Build Status](https://travis-ci.org/brutaldev/logfile-grunt.png?branch=master)](https://travis-ci.org/brutaldev/logfile-grunt)
[![Dependencies](https://david-dm.org/brutaldev/logfile-grunt.png)](https://david-dm.org/brutaldev/logfile-grunt)
[![DevDependencies](https://david-dm.org/brutaldev/logfile-grunt/dev-status.png)](https://david-dm.org/brutaldev/logfile-grunt#info=devDependencies&view=table)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)


> Simple text file logging for Grunt and task output.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install logfile-grunt --save-dev
```

Once the plugin has been installed, the simplest way to enable it inside your [Gruntfile](http://gruntjs.com/sample-gruntfile) is with this line of JavaScript:

```js
require('logfile-grunt')(grunt);
```

[Grunt](http://gruntjs.com/) output and task information that is usually logged to console will also be logged file. Don't worry, all your console information will still be available, it will additionally be written to file as well.

### Options
The plugin can take an options object to enable you to override things like the path of the log file and whether to clear it each time you run [Grunt](http://gruntjs.com/).

#### options.filePath
Type: `String`
Default value: `'./logs/grunt.log'`

A file name (and path) where your log file will be created.

#### options.clearLogFile
Type: `Boolean`
Default value: `false`

Setting `clearLogFile` to `true` will ensure the log file emptied each time you run this task. Setting `clearLogFile` to `false` will continue to append to the same log file each time [Grunt](http://gruntjs.com/) is executed.

#### options.keepColors
Type: `Boolean`
Default value: `false`

Setting `keepColors` to `true` will retain the console color codes and write them to the log file. Note that the console color codes can often make the text log difficult to read.

### Usage Examples

#### Default Options
In this example with no options, all the output you see in the console from both Grunt and running tasks will also be written to `./logs/grunt.log`. The log file text will have console color codes stripped out by default as well.

```js
require('logfile-grunt')(grunt);
```

#### Custom File Option
In this example, you can provide a custom file path for your log file by providing a name and path in the options object.

```js
require('logfile-grunt')(grunt, { filePath: './logs/MyCustomLogs.txt' });
```

#### Clear Log Option
In this example, the custom log file will be cleared on every time [Grunt](http://gruntjs.com/) is executed. This is useful for release build log files for example.

```js
require('logfile-grunt')(grunt, { filePath: './logs/ClearedOnEveryRun.log', clearLogFile: true });
```

#### Keep Colors Option
In this example, the log file will retain the console color codes used by [Grunt](http://gruntjs.com/).

```js
require('logfile-grunt')(grunt, { keepColors: true });
```

#### Task Specific Logs
The normal usage would be to `require` the plugin at the beginning of your [Gruntfile](http://gruntjs.com/sample-gruntfile) so that all output will be logged no matter what task you run. If you need to send output to different log files depending on the task, you will need to performs the `require` inside a `taskFunction` which can be provided when you [register a task](http://gruntjs.com/api/grunt.task#creating-tasks).

```js
grunt.task.registerTask('devlog', 'Keep appending everything to a log file.', function() {
  require('logfile-grunt')(grunt, { filePath: './logs/MyDevLog.txt', clearLogFile: false });
});

grunt.task.registerTask('buildlog', 'Create a new release build log files on each run.', function() {
  require('logfile-grunt')(grunt, { filePath: './dist/build.log', clearLogFile: true });
});

// Then include these tasks inside other tasks.
// Make sure it's the first one so that all output is written to the log file.
task.registerTask('default', ['devlog', 'jshint', 'qunit', 'concat', 'uglify']);
task.registerTask('dist', ['buildlog', 'concat:dist', 'uglify:dist']);
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2014-01-25  -  v0.1.0  -  Initial release.
 * 2014-01-25  -  v0.1.1  -  Official release.
 * 2014-01-27  -  v0.1.2  -  Updated NPM keywords.
 * 2014-01-28  -  v0.1.3  -  Fix crash when presented with a Buffer in the stdout stream. Works even better now printing any arb stuff coming through the stream.
 * 2014-03-10  -  v0.1.4  -  Added option to keep console colors in the log output.
 * 2014-03-10  -  v0.1.5  -  Keep NPM version numbers happy.

## License
Copyright (c) 2014 Werner van Deventer. Licensed under the MIT license.
