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

var BstUpkScanner = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.childProcess = this.conf['scanner']['childProcess'];
    this.cycleInterval = this.conf['scanner']['cycleInterval'];

    this.workingListTencent = [];
    this.workingListBns = [];
    this.duplicateUpkNames = [];

    this.statusWorkingChildProcess = 0;
};

BstUpkScanner.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkScanner] Start to scan upk files ...');
    self.util.printHr();

    // 收集tencent目录下的upk文件path
    self.grunt.file.recurse(self.util.getTencentPath(), function(abspath, rootdir, subdir, filename) {
        if (filename.match(/\d+.upk/) !== null) {
            self.workingListTencent.push(abspath);
        }
    });

    // 收集bns目录下的upk文件path
    self.grunt.file.recurse(self.util.getBnsPath(), function(abspath, rootdir, subdir, filename) {
        if (filename.match(/\d+.upk/) !== null) {
            self.workingListBns.push(abspath);
        }
    });

    // 取出所有tencent目录下upk的文件名
    var tencentUpkFileNames = [];
    _.each(self.workingListTencent, function(tencentUpkPath) {
        tencentUpkFileNames.push(path.basename(tencentUpkPath));
    });
    // 查找重复的upk文件名
    _.each(self.workingListBns, function(bnsUpkPath) {
        var bnsUpkFileName = path.basename(bnsUpkPath);
        if (tencentUpkFileNames.indexOf(bnsUpkFileName) !== -1) {
            self.duplicateUpkNames.push(bnsUpkFileName);
        }
    });
    self.grunt.log.writeln('[BstUpkScanner] Duplicated file names: ' + self.util.formatJson(self.duplicateUpkNames));
    self.util.printHr();

    self.process();
};

BstUpkScanner.prototype.process = function() {

    if () {

    }

};

BstUpkScanner.prototype.processSingle = function(upkPath) {
    this.grunt.log.writeln('[BstUpkScanner] Start to handle file ' + path.basename(upkPath));
};

BstUpkScanner.prototype.startProcess = function(upkPath) {
    this.statusWorkingChildProcess++;
};

BstUpkScanner.prototype.finishProcess = function(upkPath) {
    this.statusWorkingChildProcess--;
    this.grunt.log.writeln('[BstUpkScanner] File ' + path.basename(upkPath) + ' done ...');
    this.util.printHr();
};

module.exports = BstUpkScanner;