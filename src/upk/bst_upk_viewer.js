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

var BstUpkViewer = function(grunt, done) {
    this.grunt    = grunt;
    this.util     = new BstUtil(grunt);
    this.taskDone = done; // notify grunt: tasks done

    this.conf = this.util.readJsonFile('./config/setting.json');

    this.gruntWorkingPath = process.cwd();
    this.working3DPath = path.join(this.gruntWorkingPath, 'working_3d');

    this.workingList = [];
};

BstUpkViewer.prototype.start = function(partType, elementId) {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkViewer] Start view upk ...');
    self.util.printHr();

    self.util.partTypeCheck(partType);

    // clear working dir
    self.grunt.log.writeln('[BstUpkViewer] Clean the tmp working dir: ' + self.working3DPath);
    var clearWorkingDir = function() {
        self.grunt.file.recurse(self.working3DPath, function(abspath, rootdir, subdir, filename) {
            if (filename !== 'working_3d_dir') {
                self.util.deleteFile(abspath);
            }
        });
    };
    clearWorkingDir();
    self.util.printHr();

    // read conf
    self.grunt.log.writeln('[BstUpkViewer] Read conf of target element, id: ' + elementId);
    var element = self.util.getElementDataFromPartConfFile(partType, elementId);
    self.grunt.log.writeln('[BstUpkViewer] Target element conf found: ' + self.util.formatJson(element));
    self.util.printHr();

    // copy resources upk into working dir
    self.grunt.log.writeln('[BstUpkViewer] Prepare resource upk files ...');
    var copyResourceUpk = function(upkId) {
        self.util.copyFile(
            self.util.findUpkPath(upkId, function() {
                self.grunt.fail.fatal('[BstUpkViewer] Target upk not found ...');
            }),
            path.join(self.working3DPath, upkId + '.upk')
        );
    };
    copyResourceUpk(element['skeleton']);
    copyResourceUpk(element['texture']);
    copyResourceUpk(element['material']);
    copyResourceUpk(element['col1Material']);

    // scan upkId.log to copy all resources upk
    var upkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, element['skeleton'] + '.log'));
    _.each(upkLog, function(line) {
        var match = line.match(/(\d+).upk/);
        if (match !== null) {
            copyResourceUpk(match[1]);
        }
    });
    self.util.printHr();

    var displayModel = function() {
        // 将upk文件使用umodel进行可视化
        var worker = cp.exec(
            'umodel.exe -view -meshes -path=' + self.working3DPath + ' -game=bns ' + element['skeleton'],
            {"cwd": './resources/umodel/'}
        );
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) { clearWorkingDir(); self.taskDone(); });
    };

    // edit the upk skeleton if col is not col1
    if (element['col'] !== 'col1') {
        self.grunt.log.writeln('[BstUpkViewer] Edit skeleton upk file to display not col1 materials ...');
        self.util.readHexFile(path.join(self.working3DPath, element['skeleton'] + '.upk'), function(data, skeletonPath) {
            // 将col1的配色upk名 替换成 非col1的配色upk名
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['col1Material']), self.util.strUtf8ToHex(element['material']));
            // 将col1 替换成 非col1配色的colId
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex('col1'), self.util.strUtf8ToHex(element['col']));
            // 储存文件到 skeletonPath
            self.util.writeHexFile(skeletonPath, data);
            self.grunt.log.writeln('[BstUpkViewer] Skeleton file edited: ' + skeletonPath);
            // 展示模型
            displayModel();
        });
    } else {
        displayModel(); // 直接展示模型
    }

};

module.exports = BstUpkViewer;