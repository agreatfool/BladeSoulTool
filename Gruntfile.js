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

var path = require('path');
var moment = require('moment');
/**
 * @type {BstConst|exports}
 */
var BstConst = require('./src/const/bst_const.js');

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
                        "!**/*.log", // exclude all *.log files
                        "!**/*.png", // exclude all *.png files
                        "!**/*.tga", // exclude all *.tga files
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

    var Task_MeshParser = function() { // --part=body
        var Parser = require('./src/mesh/bst_mesh_parser.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_MeshParser] Command line option "--part" not given, use default value: "body-mesh".');
            part = BstConst.PART_BODY;
        }

        var parser = new Parser(grunt);
        parser.start(part);
    };

    var Task_MeshParser_Prepare = function() {
        var Parser = require('./src/mesh/bst_mesh_parser.js');

        this.async();

        var parser = new Parser(grunt);
        parser.dataPrepare();
    };

    var Task_MeshParser_Check = function() { // --part=body
        var Parser = require('./src/mesh/bst_mesh_parser.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_MeshParser_Check] Command line option "--part" not given, use default value: "body-mesh".');
            part = BstConst.PART_BODY;
        }

        var parser = new Parser(grunt);
        parser.dataCheck(part);
    };

    var Task_ScreenShooter = function() {
        var Shooter = require('./src/screenshot/bst_screen_shooter.js');

        this.async();

        var shooter = new Shooter(grunt);
        shooter.start();
    };

    var Task_ScreenShooter_Check = function() {
        var Shooter = require('./src/screenshot/bst_screen_shooter.js');

        this.async();

        var shooter = new Shooter(grunt);
        shooter.checkShotResult('./logs/05_shooter-grunt_2014-05-06_20-49-25.log');
    };

    var Task_IconDumper = function() {
        var Dumper = require('./src/icon/bst_icon_dumper.js');

        this.async();

        var dumper = new Dumper(grunt);
        dumper.start();
    };

    var Task_PngOptimizer = function() {
        var Optimizer = require('./src/png/bst_png_optimizer.js');

        this.async();

        var optimizer = new Optimizer(grunt);
        optimizer.start();
    };

    var Task_UpkScanner = function() {
        var Scanner = require('./src/upk/bst_upk_scanner.js');

        this.async();

        var scanner = new Scanner(grunt);
        scanner.start();
    };

    var Task_UpkParser = function() {
        var Scanner = require('./src/upk/bst_upk_parser.js');

        this.async();

        var scanner = new Scanner(grunt);
        scanner.start();
    };

    var Task_Replace = function() { // --part=body --model=:modelId
        var Replace = require('./src/replace/bst_replace.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_Replace] Command line option "--part" not given, use default value: "body".');
            part = BstConst.PART_BODY;
        }
        var modelId = grunt.option('model');

        var replace = new Replace(grunt);
        replace.start(part, modelId);
    };

    var Task_Restore = function() {
        var Restore = require('./src/restore/bst_restore.js');

        this.async();

        var restore = new Restore(grunt);
        restore.start();
    };

    //-------------------------------------------------------------------------------------------
    // Tasks
    //-------------------------------------------------------------------------------------------
    grunt.registerTask('default', Task_Default);
    grunt.registerTask('parser', Task_MeshParser);
    grunt.registerTask('parser_prepare', Task_MeshParser_Prepare);
    grunt.registerTask('parser_check', Task_MeshParser_Check);
    grunt.registerTask('shooter', Task_ScreenShooter);
    grunt.registerTask('shooter_check', Task_ScreenShooter_Check);
    grunt.registerTask('icon_dumper', Task_IconDumper);
    grunt.registerTask('png_optimizer', Task_PngOptimizer);
    grunt.registerTask('upk_scanner', Task_UpkScanner);
    grunt.registerTask('upk_parser', Task_UpkParser);

    grunt.registerTask('replace', Task_Replace);
    grunt.registerTask('restore', Task_Restore);

};