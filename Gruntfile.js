"use strict";

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Object.prototype.findByVal = function(val) {
    var result = null;
    for (var key in this) {
        if (!this.hasOwnProperty(key)) {
            continue;
        }
        if (val == this[key]) {
            result = {};
            result[key] = val;
            break;
        }
    }
    return result;
};

Object.prototype.shift = function() {
    var result = [];
    for (var key in this) {
        if (!this.hasOwnProperty(key)) {
            continue;
        }
        result = [key, this[key]];
        delete this[key];
        break;
    }
    return (result.length > 0) ? result : false;
};

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lcfist = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.countOccurence = function(needle) {
    var match = this.match(new RegExp(needle, 'g'));
    if (match === null) {
        return 0;
    } else {
        return match.length;
    }
};

var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var _ = require('underscore');
var moment = require('moment');
/**
 * @type {BstConst|exports}
 */
var BstConst = require('./src/const/bst_const.js');
/**
 * @type {BstUtil|exports}
 */
var BstUtil = require('./src/util/bst_util.js');

module.exports = function(grunt) {

    //------------------------------------------------------------------------------------------------
    //- UTILITY
    //------------------------------------------------------------------------------------------------
    // 拷贝文件夹
    grunt.file.copyDir = function(src, dest, fileFilter, dirFilter) {
        grunt.log.writeln('Copying dir from: ' + src + ', to: ' + dest);

        grunt.file.recurse(src, function(abspath, rootdir, subdir, filename) {
            if (dirFilter) {
                for (var dfKey in dirFilter) {
                    if (!dirFilter.hasOwnProperty(dfKey)) {
                        continue;
                    }
                    if (abspath.indexOf(dirFilter[dfKey]) !== -1) {
                        return;
                    }
                }
            }
            if (fileFilter) {
                for (var ffKey in fileFilter) {
                    if (!fileFilter.hasOwnProperty(ffKey)) {
                        continue;
                    }
                    if (filename.indexOf(fileFilter[ffKey]) !== -1) {
                        return;
                    }
                }
            }

            var targetPath = subdir ? path.join(dest, subdir, filename) : path.join(dest, filename);

            grunt.file.copy(abspath, targetPath);
        });
    };

    // 记录grunt运行日志
    require('logfile-grunt')(grunt, {
        "filePath": path.join(process.cwd(), 'logs', 'grunt_' + moment().format('YYYY-MM-DD_HH-mm-ss') + '.log'),
        "clearLogFile": true
    });

    // zip 压缩插件
    grunt.initConfig({
        "compress": {
            "main": {
                "options": {
                    "archive": "BladeSoulTool.zip",
                    "mode": "zip",
                    "level": 9,
                    "pretty": true
                },
                "files": [{
                    "expand": true,
                    "src": [
                        "**", // including all files first
                        "!**/.DS_Store", // exclude MAC Finder dirs
                        "!**/Thumbs.db", // exclude Thumbs.db files
                        "!run.bat", // exclude run.bat file
                        "!run.sh", // exclude run.sh file
                        "!.gitignore", // exclude .gitignore file
                        "!.git", // exclude .git dir
                        "!.idea", // exclude the .idea dir
                        "!**/*.zip", // exclude all *.zip files
                        "!**/*.png", // exclude all *.png files
                        "!**/*.tga", // exclude all *.tga files
                        "!logs/*.log", // exclude all grunt *.log files
                        "!resources/dedat/output/**/*", // exclude dedat output
                        "!resources/optipng/output/**/*", // exclude optipng output
                        "!resources/tga2png/output/**/*", // exclude tga2png output
                        "!resources/umodel/output/**/*", // exclude umodel output
                        // VS UI rules
                        "!**/*.cs", // exclude *.cs files
                        "!**/*.resx", // exclude *.resx files
                        "!**/*.csproj", // exclude *.csproj files
                        "!**/*.csproj.user", // exclude *.csproj.user files
                        "!**/*.sln", // exclude *.sln files
                        "!**/*.suo", // exclude *.suo files
                        "!VS_GUI/BladeSoulTool/log/*.log", // exclude VS log files
                        "!VS_GUI/BladeSoulTool/lib", // exclude VS UI lib
                        "!VS_GUI/BladeSoulTool/obj/**/*", // exclude VS UI obj
                        "!VS_GUI/BladeSoulTool/Properties", // exclude VS UI Properties
                        "!VS_GUI/BladeSoulTool/resources/wekeroad-ink.vssettings", // exclude resources
                        "!VS_GUI/BladeSoulTool/ui" // exclude VS UI ui
                    ],
                    "dest": "BladeSoulTool/"
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compress');

    //------------------------------------------------------------------------------------------------
    //- TASK
    //------------------------------------------------------------------------------------------------
    var Task_Default = function() {
        this.async();
    };

    var Task_ScreenShooter = function() {
        var Shooter = require('./src/screenshot/bst_screen_shooter.js');

        var done = this.async();

        var shooter = new Shooter(grunt, done);
        shooter.start();
    };

    var Task_IconDumper = function() {
        var Dumper = require('./src/icon/bst_icon_dumper.js');

        var done = this.async();

        var dumper = new Dumper(grunt, done);
        dumper.start();
    };

    var Task_PngOptimizer = function() {
        var Optimizer = require('./src/png/bst_png_optimizer.js');

        var done = this.async();

        var optimizer = new Optimizer(grunt, done);
        optimizer.start();
    };

    var Task_UpkEnvPreparer = function() {
        var Preparer = require('./src/upk/bst_upk_env_preparer.js');

        var done = this.async();

        var forceDedat = true; // 默认强制重新dedat数据
        var preparer = new Preparer(grunt, done, forceDedat);
        preparer.start();
    };

    var Task_UpkScanner = function() {
        var Scanner = require('./src/upk/bst_upk_scanner.js');

        var done = this.async();

        var scanner = new Scanner(grunt, done);
        scanner.start();
    };

    var Task_UpkParser = function() {
        var Scanner = require('./src/upk/bst_upk_parser.js');

        var done = this.async();

        var scanner = new Scanner(grunt, done);
        scanner.start();
    };

    var Task_UpkViewer = function() { // --part=costume --model=:modelId
        var Viewer = require('./src/upk/bst_upk_viewer.js');

        var done = this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_UpkViewer] Command line option "--part" not given, use default value: "costume".');
            part = BstConst.PART_TYPE_COSTUME;
        }
        var modelId = grunt.option('model');

        var viewer = new Viewer(grunt, done);
        viewer.start(part, modelId);
    };

    var Task_Replace = function() { // --part=costume --model=modelId --race=KunN
        var Replace = require('./src/replace/bst_replace.js');

        var done = this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_Replace] Command line option "--part" not given, use default value: "body".');
            part = BstConst.PART_TYPE_COSTUME;
        }
        var race = grunt.option('race');
        if (typeof part === 'undefined' || part == null || part == '' || part == 'null') {
            grunt.log.error('[Grunt Task_Replace] Command line option "--race" not given, use "null".');
            race = null;
        }
        var modelId = grunt.option('model');

        var replace = new Replace(grunt, done);
        replace.start(part, race ,modelId);
    };

    var Task_Restore = function() {
        var Restore = require('./src/restore/bst_restore.js');

        var done = this.async();

        var restore = new Restore(grunt, done);
        restore.start();
    };

    var Task_BuildPreparer = function() {
        var util = new BstUtil(grunt);
        // 事先删除上次截屏流程产生出来的中间png文件
        _.each(BstConst.PART_TYPES, function(type) {
            var pngOutputPath = path.join(BstConst.PATH_DATABASE, type, 'pics');
            util.deleteDir(pngOutputPath, false);
            util.mkdir(pngOutputPath);
        });
    };

    //-------------------------------------------------------------------------------------------
    // Tasks
    //-------------------------------------------------------------------------------------------
    grunt.registerTask('default', Task_Default);

    grunt.registerTask('shooter', Task_ScreenShooter);
    grunt.registerTask('icon_dumper', Task_IconDumper);
    grunt.registerTask('png_optimizer', Task_PngOptimizer);
    grunt.registerTask('upk_preparer', Task_UpkEnvPreparer);
    grunt.registerTask('upk_scanner', Task_UpkScanner);
    grunt.registerTask('upk_parser', Task_UpkParser);

    grunt.registerTask('upk_viewer', Task_UpkViewer);
    grunt.registerTask('replace', Task_Replace);
    grunt.registerTask('restore', Task_Restore);

    grunt.registerTask('build_preparer', Task_BuildPreparer);
    grunt.registerTask('build', [
        'build_preparer',
        'icon_dumper',
        'png_optimizer',
        'upk_preparer',
        'upk_scanner',
        'upk_parser',
        'shooter',
        'png_optimizer'
    ]);
    grunt.registerTask('build_shot', [
        'shooter',
        'png_optimizer'
    ]);
};