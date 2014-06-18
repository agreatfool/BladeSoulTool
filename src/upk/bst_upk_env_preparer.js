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

var BstUpkEnvPreparer = function(grunt, done, forceDedat) {
    this.grunt       = grunt;
    this.util        = new BstUtil(grunt);
    this.taskDone    = done; // notify grunt: tasks done
    this.forceDedat  = forceDedat;

    this.conf = this.util.readJsonFile('./config/setting.json');

    this.gruntWorkingPath = process.cwd();
};

BstUpkEnvPreparer.prototype.start = function() {
    var self = this;

    /**
     * 在分析mesh.xml的upk信息的时候，我们需要对upk进行解包，
     * 而umodel在执行的时候，需要对应的所有关联upk的信息，因为有一部分是放在tencentPath下，不在bnsPath下，
     * 所以会出现读取不到的问题，这里需要我们预先把tencentPath下的upk拷贝到bnsPath下
     */
    self.grunt.log.writeln('[BstUpkEnvPreparer] Start to copy upk files from tencent dir to bns dir ...');
    if (self.grunt.file.exists(self.util.getTencentPath())) { // 为之后韩服做准备，韩服不需要这个步骤
        self.grunt.file.recurse(self.util.getTencentPath(), function(abspath, rootdir, subdir, filename) {
            var targetPath = path.join(self.util.getBnsPath(), filename);
            if (!self.grunt.file.exists(targetPath)) {
                // 目标不存在，直接拷贝
                self.util.copyFile(abspath, targetPath);
            } else {
                // 目标已存在，忽略
                self.grunt.log.error('[BstUpkEnvPreparer] Target upk already exists in bns dir: ' + targetPath);
            }
        });
    }

    // 因为之后可能使用到mesh.xml，所以需要先将其解包出来
    self.grunt.log.writeln('[BstUpkEnvPreparer] Start to dedat xml.dat ...');
    if (self.forceDedat // 强制执行
        || (!self.forceDedat && !self.grunt.file.exists(BstConst.PATH_MESH_XML))) { // 没有已经被解包的dat文件内容，需要现场解包
        var xmlDatPath = path.join(self.conf['path']['game'], self.conf['path']['data'], 'xml.dat');
        this.grunt.log.writeln('[BstUpkEnvPreparer] Start to dedat xml.dat: ' + xmlDatPath);

        this.util.checkFileExists(xmlDatPath);

        var worker = cp.spawn('dated_from208.exe', [xmlDatPath, '--', 'output', '--', 'd'], {"cwd": './resources/dedat/'});
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) {
            self.util.logChildProcessExit('dedat', code);
            self.taskDone();
        });
    }
};

module.exports = BstUpkEnvPreparer;