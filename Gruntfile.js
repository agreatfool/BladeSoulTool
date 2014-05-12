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

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lcfist = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

var path = require('path');
var moment = require('moment');
/**
 * @type {BstConst|exports}
 */
var BstConst = require('./src/const/bst_const.js');

module.exports = function(grunt) {

    require('logfile-grunt')(grunt, {
        "filePath": path.join(process.cwd(), 'logs', 'grunt_' + moment().format('YYYY-MM-DD_HH-mm-ss') + '.log'),
        "clearLogFile": true
    });

    var Task_Default = function() {
        this.async();
    };

    var Task_Crawler = function() { // --part=body
        var Crawler = require('./src/crawler/bst_crawler.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_Crawler] Command line option "--part" not given, use default value: "body".');
            part = BstConst.PART_BODY;
        }

        var crawler = new Crawler(grunt);
        crawler.start(part);
    };

    var Task_Crawler_MatchCheck = function() { // --part=body
        var Crawler = require('./src/crawler/bst_crawler.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_Crawler_MatchCheck] Command line option "--part" not given, use default value: "body".');
            part = BstConst.PART_BODY;
        }

        var crawler = new Crawler(grunt);
        crawler.matchCheck(part);
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

    var Task_ScreenShooter = function() { // --part=body
        var Shooter = require('./src/screenshot/bst_screen_shooter.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_ScreenShooter] Command line option "--part" not given, use default value: "body".');
            part = BstConst.PART_BODY;
        }

        var shooter = new Shooter(grunt);
        shooter.start(part);
    };

    var Task_ScreenShooter_Check = function() {
        var Shooter = require('./src/screenshot/bst_screen_shooter.js');

        this.async();

        var shooter = new Shooter(grunt);
        shooter.checkShotResult('./logs/05_shooter-grunt_2014-05-06_20-49-25.log');
    };

    var Task_UpkScanner = function() {
        var Scanner = require('./src/upk/bst_upk_scanner.js');

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
    grunt.registerTask('crawler', Task_Crawler);
    grunt.registerTask('crawler_check', Task_Crawler_MatchCheck);
    grunt.registerTask('parser', Task_MeshParser);
    grunt.registerTask('parser_prepare', Task_MeshParser_Prepare);
    grunt.registerTask('parser_check', Task_MeshParser_Check);
    grunt.registerTask('shooter', Task_ScreenShooter);
    grunt.registerTask('shooter_check', Task_ScreenShooter_Check);
    grunt.registerTask('scanner', Task_UpkScanner);

    grunt.registerTask('replace', Task_Replace);
    grunt.registerTask('restore', Task_Restore);

};