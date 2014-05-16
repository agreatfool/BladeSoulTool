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

var BstIconDumper = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.childProcess = this.conf['icon_dumper']['childProcess'];
    this.cycleInterval = this.conf['icon_dumper']['cycleInterval'];

    this.gruntWorkingPath = process.cwd();

    this.workingList = [];

    this.statusTotalCount = 0;
    this.statusFinishedCount = 0;
    this.statusWorkingChildProcess = 0;
};

BstIconDumper.ICON_UPK_ID = '00008758';

BstIconDumper.PATH_ICON_BASE = 'database/icon';
BstIconDumper.PATH_ICON_TGA = path.join(BstIconDumper.PATH_UPK_BASE, 'tga');
BstIconDumper.PATH_ICON_PNG = path.join(BstIconDumper.PATH_UPK_BASE, 'png');

BstIconDumper.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstIconDumper] Start to dump all icon resources ...');
    self.util.printHr();

    // 解包icon的upk
    self.grunt.log.writeln('[BstIconDumper] Umodel exporting ' + BstIconDumper.ICON_UPK_ID + '.upk ...');
    cp.exec('umodel.exe -export -path=' + self.util.getBnsPath() + ' -game=bns -out=output ' + BstIconDumper.ICON_UPK_ID,
        {"cwd": './resources/umodel'},
        function(error) {
            if (error) {
                self.grunt.fail.fatal('[BstIconDumper] Error in umodel exporting ' + BstIconDumper.ICON_UPK_ID + '.upk: ' + error.stack);
            }
            self.grunt.log.writeln('[BstIconDumper] Umodel exporting ' + BstIconDumper.ICON_UPK_ID + '.upk done ...');
            self.process();
        }
    );
};

BstIconDumper.prototype.process = function() {
    var self = this;

    // 拷贝tga文件到database文件夹
    self.grunt.log.writeln('[BstIconDumper] Copying all tga icon resources from output dir to database dir ...');
    self.grunt.file.recurse(
        './resources/umodel/output/' + BstIconDumper.ICON_UPK_ID + '/Texture2D',
        function(abspath, rootdir, subdir, filename) {
            self.workingList.push(filename);
            self.util.copyFile(abspath, path.join(BstIconDumper.PATH_ICON_TGA, filename));
        }
    );
    self.grunt.log.writeln('[BstIconDumper] Copying all tga done ...');

    // 开始将tga转成png，方便预览
    var workingTimer = setInterval(function() {
        if (self.statusWorkingChildProcess < self.childProcess // 有空余的进程数
            && self.workingList.length > 0) { // 队列中仍旧有任务需要安排
            self.processTgaConvert(self.workingList.shift());
        }
        if (self.statusFinishedCount >= self.statusTotalCount) {
            clearInterval(workingTimer);
            self.grunt.log.writeln('[BstIconDumper] All works done ...');
        }
    }, self.cycleInterval);
};

BstIconDumper.prototype.processTgaConvert = function(tgaFileName) {
    var self = this;

    self.startProcess(tgaFileName);

    var tgaFilePath = path.join(BstIconDumper.PATH_ICON_TGA, tgaFileName);
    cp.exec(
        'tga2pngcmd.exe -c ' + tgaFilePath + ' ' + BstIconDumper.PATH_ICON_PNG,
        {"cwd": './resources/tga2png'},
        function(error) {
            if (error) {
                self.grunt.log.error('[BstIconDumper] Error in converting tga file ' + tgaFileName + ': ' + error.stack);
            }
            self.finishConvert(tgaFileName);
        }
    );
};

BstIconDumper.prototype.startProcess = function(tgaFileName) {
    this.grunt.log.writeln('[BstIconDumper] Start to covnert tga file ' + tgaFileName);
    this.statusWorkingChildProcess++;
};

BstIconDumper.prototype.finishConvert = function(tgaFileName) {
    this.statusWorkingChildProcess--;
    this.statusFinishedCount++;
    this.grunt.log.writeln('[BstIconDumper] File ' + tgaFileName + ' converted, progress: ' +
        this.statusFinishedCount + ' / ' + this.statusTotalCount);
    this.util.printHr();
};

module.exports = BstIconDumper;