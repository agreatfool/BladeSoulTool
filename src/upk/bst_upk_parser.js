"use strict";

var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var _ = require('underscore');

/**
 * @type {BstUtil|exports}
 */
var BstUtil = require('../util/bst_util.js');
/**
 * @type {BstConst|exports}
 */
var BstConst = require('../const/bst_const.js');

var BstUpkParser = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);
};

BstUpkParser.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkParser] Start to parse upk files ...');
    self.util.printHr();

    self.grunt.file.recurse('database/costume/upk', function(abspath, rootdir, subdir, filename) {
        if (filename !== 'upk_dir') {
            self.process(abspath);
        }
    });
};

BstUpkParser.prototype.process = function(logPath) {
    var self = this;
};

BstUpkParser.prototype.finishProcess = function(upkPath) {
};

module.exports = BstUpkParser;