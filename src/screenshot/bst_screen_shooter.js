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

var BstScreenShooter = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.shotInterval = this.conf['shooter']['interval'];

    this.part = null; // 当前抓的是哪个部分的图：body、face、hair

    this.data = {}; // 需要处理的数据：database/costume/[this.part]/data.json, etc...
    this.workingList = null; // 需要处理的数据的键数组：_.keys(this.data)

    this.statusTotalCount = 0; // 总共需要处理的模型个数
    this.statusFinishedCount = 0; // 处理完成的模型个数
    this.statusIsWorking = false; // 因为需要截图，必须单进程，这里存储是否在工作的状态
};

BstScreenShooter.prototype.start = function(part) {
    this.util.printHr();
    if ([BstConst.PART_BODY, BstConst.PART_FACE, BstConst.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstScreenShooter] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstScreenShooter] Start to take screenshot of part: ' + part);
    this.util.printHr();

    this.part = part;

    this.process();
};

BstScreenShooter.prototype.process = function() {
    var rawData = this.util.readJsonFile('./database/costume/' + this.part + '/data.json');
    switch (this.part) {
        case BstConst.PART_BODY:
            this.processBody(rawData);
            break;
        case BstConst.PART_FACE:
            this.processFace(rawData);
            break;
        case BstConst.PART_HAIR:
            this.processHair(rawData);
            break;
        default:
            break;
    }
};

BstScreenShooter.prototype.processBody = function(rawData) {
    var self = this;

    _.each(rawData, function(raceData) {
        self.data = _.extend(self.data, raceData);
    });
    self.workingList = _.keys(self.data);
    self.statusTotalCount = self.workingList.length;

    self.grunt.log.writeln('[BstScreenShooter] body data loaded, "' + self.statusTotalCount + '" lines of record read.');
    self.util.printHr();

    var timer = setInterval(function() {
        if (!self.statusIsWorking && self.workingList.length > 0) {
            // 目前没有运行中的任务，安排任务
            self.statusIsWorking = true;
            self.processSingle(self.data[self.workingList.shift()]);
        }
        if (self.workingList.length == 0) {
            // 任务全部完成
            clearInterval(timer);
            self.util.printHr();
            self.grunt.log.writeln('[BstScreenShooter] All "' + self.part + '" photo shot.');
            // TODO 最后应该添上压缩图片，和统一删除所有备份文件的功能
        }
    }, 500);
};

BstScreenShooter.prototype.processFace = function(rawData) {

};

BstScreenShooter.prototype.processHair = function(rawData) {

};

BstScreenShooter.prototype.processSingle = function(element) {
    var self = this;

    var name = element['codeWithRace'] + '_' + element['col'];
    self.grunt.log.writeln('[BstScreenShooter] Start to process: ' + name);

    // 确保当前元素的格式是规范的
    if (self.util.meshDataKeyCheck(element)) { // true返回表示有异常键值
        self.finishSingle(name); // 格式不规范，停止执行
        return;
    }

    // 确保skeleton文件存在
    var skeletonPath = self.util.findUpkPath(element['skeleton'], function() {
        self.finishSingle(name); // 即便文件不存在，也要将其标记为完成
    });
    if (skeletonPath === null) {
        return; // 两个位置upk文件都不存在，只能跳过该项
    }

    var hasBackupToRestore = false;
    var backupPath = null;

    // 修改skeleton骨骼upk里的值，调整成非默认配色
    var handleUpk = function() {
        hasBackupToRestore = true;
        // 备份源文件
        backupPath = self.util.backupFile(skeletonPath);
        self.util.readHexFile(skeletonPath, function(data, path) {
            // 将col1的配色upk名 替换成 非col1的配色upk名
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['col1Material']), self.util.strUtf8ToHex(element['material']));
            // 将col1 替换成 非col1配色的colId
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex('col1'), self.util.strUtf8ToHex(element['col']));
            // 储存文件到 skeletonPath
            self.util.writeHexFile(path, data);
            self.grunt.log.writeln('[BstScreenShooter] Skeleton file edited: ' + skeletonPath);
            // 执行下一步
            handleUmodel();
        });
    };

    // 将upk文件使用umodel进行可视化
    var handleUmodel = function() {
        var worker = cp.exec(
            'umodel.exe -view -meshes -path=' + path.dirname(skeletonPath) + ' -game=bns ' + element['skeleton'],
            {"cwd": './resources/umodel/'}
        );
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) {
            self.util.logChildProcessStderr(data);
            // 取消之后的截图工作，因为umodel出错了，骨骼预览根本没出来
            clearTimeout(timer);
            if (element['col'] !== 'col1') {
                // 出错了，而且当前material并非col1，则直接将col1的图拷贝过来
                var imgBasePath = path.join('database/costume/pics', self.part);
                var col1ImgPath = path.join(imgBasePath, element['codeWithRace'] + '_col1.png');
                if (self.grunt.file.exists(col1ImgPath)) {
                    self.util.copyFile(
                        col1ImgPath,
                        path.join(imgBasePath, name + '.png')
                    );
                }
            }
            handleBackup();
        });
        worker.on('exit', function (code) { self.util.logChildProcessExit('umodel', code); });
        var timer = setTimeout(function() {
            handleWinSize();
        }, self.shotInterval); // 间隔启动下一个工作，因为在umodel窗口打开期间，worker子进程是不会退出的，流程无法继续执行下去
    };

    var xPos = 100, yPos = 0, width = 500, height = 600;
    // 使用nircmd调整可视化骨骼的窗口位置及大小
    var handleWinSize = function() {
        var worker = cp.exec(
            'nircmd win setsize stitle "UE Viewer" ' + xPos + ' ' + yPos + ' ' + width + ' ' + height,
            {"cwd": './resources/nircmd/'}
        );
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) {
            self.util.logChildProcessExit('nircmd win setsize', code);
            handleScreenShot();
        });
    };

    // 截取umodel显示出来的骨骼图
    var handleScreenShot = function() {
        var worker = cp.exec(
            'screenshot-cmd.exe -rc ' + xPos + ' ' + yPos + ' ' + (xPos + width) + ' ' + (yPos + height) +
                ' -o ' + '../../database/costume/pics/' + self.part + '/' + name + '.png',
            {"cwd": './resources/screenshot/'}
        );
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) {
            self.util.logChildProcessExit('screenshot-cmd', code);
            handleWinClose();
        });
    };

    // 关闭之前的骨骼窗口
    var handleWinClose = function() {
        var worker = cp.exec(
            'nircmd win close stitle "UE Viewer"',
            {"cwd": './resources/nircmd/'}
        );
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) {
            self.util.logChildProcessExit('nircmd win close', code);
            handleBackup();
        });
    };

    // 恢复之前备份的文件，如果有的话
    var handleBackup = function() {
        if (hasBackupToRestore) {
            // 恢复文件
            self.util.restoreFile(backupPath);
            // 删除旧的备份文件
            // FIXME 之后应该需要一个统一删除备份文件的处理函数
//            var gruntCwd = process.cwd();
//            self.grunt.file.setBase(path.dirname(backupPath));
//            self.util.deleteFile(backupPath);
//            self.grunt.file.setBase(gruntCwd);
            self.grunt.log.writeln('[BstScreenShooter] Skeleton file restored: ' + skeletonPath);
        }
        self.finishSingle(name);
    };

    // 开始处理
    if (element['col'] != 'col1') { // 不是默认色调，首先要处理upk文件
        handleUpk();
    } else {
        handleUmodel();
    }
};

BstScreenShooter.prototype.finishSingle = function(name) {
    this.statusIsWorking = false;
    this.statusFinishedCount++;

    this.grunt.log.writeln('[BstScreenShooter] Processing of "' + name + '" done, ' +
        'progress: ' + this.statusFinishedCount + ' / ' + this.statusTotalCount);
    this.util.printHr();
};

BstScreenShooter.prototype.checkShotResult = function(logPath) {
    var self = this;

    this.util.checkFileExists(logPath);
    var logLines = fs.readFileSync(logPath).toString().split("\r\n");

    var errorModelCodes = [];
    var currentWorkingCode = null;
    _.each(logLines, function(line) {
        var match = line.match(/\[BstScreenShooter\] Start to process: (.+)/);
        if (match !== null) {
            currentWorkingCode = match[1];
        }
        match = line.match(/\>\> \[BstScreenShooter\] process: stderr:.+/);
        if (match !== null) {
            errorModelCodes.push(currentWorkingCode);
        }
    });
    self.grunt.log.writeln(self.util.printJson(errorModelCodes));
};

module.exports = BstScreenShooter;