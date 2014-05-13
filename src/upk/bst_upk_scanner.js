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

    this.workingList = [];

    this.gruntWorkingPath = process.cwd();

    this.statusTotalCount = 0;
    this.statusFinishedCount = 0;
    this.statusWorkingChildProcess = 0;
};

BstUpkScanner.NO_OBJ_ERROR = 'Specified package(s) has no supported objects';
BstUpkScanner.UNKNOWN_MEMBER_ERROR = '*** unknown member';

BstUpkScanner.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkScanner] Start to scan upk files ...');
    self.util.printHr();

    /**
     * 扫描只会扫bns目录下的upk，因为umodel无法指定两个工作目录，所以先要运行parser_prepare，
     * 将所有不重复的upk复制到bns下，然后再开始跑scanner脚本
     */
    // 收集bns目录下的upk文件path
    self.grunt.file.recurse(self.util.getBnsPath(), function(abspath, rootdir, subdir, filename) {
        if (filename.match(/^\d+.upk$/) !== null) {
            self.workingList.push(abspath);
        }
    });

    self.statusTotalCount = self.workingList.length;
    self.grunt.log.writeln('[BstUpkScanner] Total upk files count: ' + self.workingList.length);
    self.util.printHr();

    self.process();
};

BstUpkScanner.prototype.process = function() {
    var self = this;

    var workingTimer = setInterval(function() {
        if (self.statusWorkingChildProcess < self.childProcess // 有空余的进程数
            && self.workingList.length > 0) { // 队列中仍旧有任务需要安排
            self.processSingle(self.workingList.shift());
        }
        if (self.statusFinishedCount >= self.statusTotalCount) {
            clearInterval(workingTimer);
            self.util.printHr();
            self.grunt.log.writeln('[BstUpkScanner] All works done ...');
        }
    }, self.cycleInterval);
};

BstUpkScanner.prototype.processSingle = function(upkPath) {
    var self = this;

    self.startProcess(upkPath);

    if (!self.grunt.file.exists(upkPath)) {
        self.finishProcess(upkPath);
        return;
    }

    var upkFileName = path.basename(upkPath);
    var upkId = upkFileName.substr(0, upkFileName.indexOf('.'));
    cp.exec(
        'umodel.exe -dump -path=' + path.dirname(upkPath) + ' -game=bns ' + upkId,
        {"cwd": './resources/umodel', "maxBuffer": 5*1024*1024}, // max buff 5M
        function(error, stdout) {
            if (error !== null) {
                if (stdout.indexOf(BstUpkScanner.NO_OBJ_ERROR) !== -1) {
                    // 目标upk没有可用的objects
                    self.grunt.log.error('[BstUpkScanner] Error in scanning file: ' + upkId + ', upk has no supported objects ... ');
                } else if (error.stack.indexOf(BstUpkScanner.UNKNOWN_MEMBER_ERROR) !== -1) {
                    // 目标upk含有未知的成员
                    self.grunt.log.error('[BstUpkScanner] Error in scanning file: ' + upkId + ', upk has unknown member ... ');
                } else {
                    // 普通的错误
                    self.grunt.log.error('[BstUpkScanner] Error in scanning file: ' + upkId + ', error: ' + error.stack);
                }
                self.finishProcess(upkPath);
            }
            self.util.writeFile(path.join(self.gruntWorkingPath, 'database/costume/upk', upkId + '.log'), stdout.toString());
            self.finishProcess(upkPath);
        }
    );
};

BstUpkScanner.prototype.startProcess = function(upkPath) {
    this.grunt.log.writeln('[BstUpkScanner] Start to handle file ' + path.basename(upkPath));
    this.statusWorkingChildProcess++;
};

BstUpkScanner.prototype.finishProcess = function(upkPath) {
    this.statusWorkingChildProcess--;
    this.statusFinishedCount++;
    this.grunt.log.writeln('[BstUpkScanner] File ' + path.basename(upkPath) + ' done, progress: ' +
        this.statusFinishedCount + ' / ' + this.statusTotalCount);
    this.util.printHr();
};

module.exports = BstUpkScanner;