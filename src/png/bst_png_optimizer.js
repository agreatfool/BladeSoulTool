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

var BstPngOptimizer = function(grunt, done) {
    this.grunt    = grunt;
    this.util     = new BstUtil(grunt);
    this.taskDone = done; // notify grunt: tasks done

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.tasks = this.conf['png_optimizer']['tasks'];
    this.childProcess = this.conf['png_optimizer']['options']['childProcess'];
    this.cycleInterval = this.conf['png_optimizer']['options']['cycleInterval'];

    this.gruntWorkingPath = process.cwd();

    this.statusIsTaskRunning = false;
    this.statusTotalTaskCount = _.keys(this.tasks).length;
    this.statusFinishedTaskCount = 0;

    this.workingList = [];
    this.taskName = '';
    this.outputDir = '';
    this.optiLevel = 3;

    this.statusErrorList = []; // 在图片压缩的过程中出错的图片名

    this.statusTotalCount = 0;
    this.statusFinishedCount = 0;
    this.statusWorkingChildProcess = 0;
};

BstPngOptimizer.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstPngOptimizer] Start to optimize png files ...');
    self.util.printHr();

    var taskTimer = setInterval(function() {
        if (!self.statusIsTaskRunning && _.keys(self.tasks).length > 0) {
            self.statusIsTaskRunning = true;
            var taskConf = self.tasks.shift();

            self.grunt.log.writeln('[BstPngOptimizer] Start to process task: ' + taskConf[0]);

            // 重置状态
            self.workingList = [];
            self.taskName = '';
            self.outputDir = '';
            self.optiLevel = 3;
            self.statusTotalCount = 0;
            self.statusFinishedCount = 0;
            self.statusWorkingChildProcess = 0;

            // 启动
            self.taskName = taskConf[0];
            self.outputDir = path.join(self.gruntWorkingPath, taskConf[1]['dest']);
            self.optiLevel = taskConf[1]['level'];
            self.grunt.file.recurse(path.join(self.gruntWorkingPath, taskConf[1]['src']), function(abspath, rootdir, subdir, filename) {
                if (filename === 'png_dir') {
                    return; // 文件夹占位文件，忽略之
                }
                self.workingList.push(abspath);
            });
            self.statusTotalCount = self.workingList.length;
            self.grunt.log.writeln('[BstPngOptimizer] Total count: ' + self.workingList.length);
            self.grunt.log.writeln('[BstPngOptimizer] Clear output dir before run: ' + self.outputDir);
            self.util.deleteDir(self.outputDir, false); // optipng命令会自动创建目标文件夹
            self.util.printHr();
            self.processTask();
        }

        if (self.statusFinishedTaskCount >= self.statusTotalTaskCount) {
            clearInterval(taskTimer);
            if (self.statusErrorList.length > 0) {
                // 有错误，记录错误
                self.grunt.log.writeln('[BstPngOptimizer] ' + self.statusErrorList.length + ' compressions failed: ' +
                    self.util.formatJson(self.statusErrorList));
                self.util.writeFile(BstConst.PATH_PNG_CPS_FAILURE, self.util.formatJson(self.statusErrorList));
            }
            self.grunt.log.writeln('[BstPngOptimizer] All tasks done ...');
            self.taskDone();
        }

    }, self.cycleInterval);
};

BstPngOptimizer.prototype.processTask = function() {
    var self = this;

    var workingTimer = setInterval(function() {
        if (self.statusWorkingChildProcess < self.childProcess // 有空余的进程数
            && self.workingList.length > 0) { // 队列中仍旧有任务需要安排
            self.processCompress(self.workingList.shift());
        }
        if (self.statusFinishedCount >= self.statusTotalCount) {
            clearInterval(workingTimer);
            self.finishTask();
        }
    }, self.cycleInterval);
};

BstPngOptimizer.prototype.finishTask = function() {
    this.statusFinishedTaskCount++;
    this.statusIsTaskRunning = false;
    this.grunt.log.writeln('[BstPngOptimizer] Task "' + this.taskName + '" done, progress: ' +
        this.statusFinishedTaskCount + ' / ' + this.statusTotalTaskCount);
    this.util.printHr();
};

BstPngOptimizer.prototype.processCompress = function(pngFilePath) {
    var self = this;

    var pngFileName = path.basename(pngFilePath);
    self.startProcess(pngFileName);

    var pngCpsDestPath = path.join(self.outputDir, pngFileName);
    if (self.grunt.file.exists(pngCpsDestPath)) {
        // 目标压缩输出已经存在，跳过该文件
        self.finishCompress(pngFilePath);
        return;
    }

    cp.exec(
        'optipng.exe -dir ' + self.outputDir + ' -o ' + self.optiLevel + ' -clobber ' + pngFilePath,
        {"cwd": './resources/optipng'},
        function(error) {
            if (error) {
                self.grunt.log.error('[BstPngOptimizer] Error in compressing png file ' + pngFilePath + ': ' + error.stack);
                self.statusErrorList.push(pngFilePath);
            }
            self.finishCompress(pngFilePath);
        }
    );
};

BstPngOptimizer.prototype.startProcess = function(pngFileName) {
    this.grunt.log.writeln('[BstPngOptimizer] Start to compress png file ' + pngFileName);
    this.statusWorkingChildProcess++;
};

BstPngOptimizer.prototype.finishCompress = function(pngFileName) {
    this.statusWorkingChildProcess--;
    this.statusFinishedCount++;
    this.grunt.log.writeln('[BstPngOptimizer] File ' + pngFileName + ' compressed, progress: ' +
        this.statusFinishedCount + ' / ' + this.statusTotalCount);
    this.util.printHr();
};

module.exports = BstPngOptimizer;