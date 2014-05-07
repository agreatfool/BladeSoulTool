"use strict";

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

var BstReplace = function(grunt) {
    this.grunt = grunt;
    this.util = new BstUtil(grunt);

    this.backup = this.util.readJsonFile('./config/backup.json');

    this.part = null; // 当前替换的是哪个部分的模型：body、face、hair

    this.data = {}; // 模型数据：database/costume/[this.part]/data.json
    this.base = {}; // 当前指定部分的基础配置：database/costume/[this.part]/base.json
    this.modelId = null; // 当前工作需要替换的目标模型id
};

BstReplace.prototype.start = function(part, modelId) {
    this.util.printHr();
    if ([BstConst.PART_BODY, BstConst.PART_FACE, BstConst.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstReplace] Invalid start part specified: ' + part);
    }

    this.part = part;
    this.data = this.util.readJsonFile('./database/costume/' + this.part + '/data.json');
    this.base = this.util.readJsonFile('./database/costume/' + this.part + '/base.json');
    var modelIds = _.keys(this.data);
    if (!modelIds.indexOf(modelId)) {
        this.grunt.fail.fatal('[BstReplace] Invalid model id specified: ' + modelId);
    }
    this.modelId = modelId;

    this.grunt.log.writeln('[BstReplace] Start to replace model of part: ' + part);
    this.util.printHr();

    this.process();
};

BstReplace.prototype.process = function() {
    switch (this.part) {
        case BstConst.PART_BODY:
            this.processBody();
            break;
        case BstConst.PART_FACE:
            this.processFace();
            break;
        case BstConst.PART_HAIR:
            this.processHair();
            break;
        default:
            break;
    }
};

BstReplace.prototype.processBody = function() {
    var self = this;

    // 读取目标模型配置
    var element = self.data[self.modelId];
    self.grunt.log.writeln('[BstReplace] Target conf read: ' + self.util.formatJson(element));
    // 读取基本模型配置
    var base = self.base[element['race']];
    self.grunt.log.writeln('[BstReplace] Base conf read: ' + self.util.formatJson(base));

    // 准备upk路径，并验证存在
    var paths = {
        "skeleton": self.util.findUpkPath(base['skeleton']),
        "texture":  self.util.findUpkPath(base['texture']),
        "material": self.util.findUpkPath(base['material'])
    };
    for (var checkKey in paths) {
        if (!paths.hasOwnProperty(checkKey)) {
            continue;
        }
        if (paths[checkKey] === null) {
            // 如果upk没找到，直接失败，并报错给子进程，这样才能返回信息给客户端
            self.grunt.fail.fatal('[BstReplace] Target upk not found: ' + base[checkKey] + '.upk');
        }
    }
    self.grunt.log.writeln('[BstReplace] Base upk path found: ' + self.util.formatJson(paths));

    // 拷贝目标upk到working路径下
    _.each(paths, function(copyPath, copyKey) {
        self.util.copyFile(copyPath, path.join('working', base[copyKey] + '.upk'));
    });

    // 修改内容
    for (var editKey in paths) { // skeleton, texture, material
        if (!paths.hasOwnProperty(editKey)) {
            continue;
        }
        self.util.registerAsyncEvent(paths[editKey]);
        self.util.readHexFile(paths[editKey], function(data, editPath) {
            // 拷贝过来的文件内原来的：目标服装模型名 => 改为洪门道服的模型名
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['codeWithRace']), self.util.strUtf8ToHex(base['codeWithRace']));
            // 替换各upk的id名，包括texture, material, skeleton
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['texture']), self.util.strUtf8ToHex(base['texture']));
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['material']), self.util.strUtf8ToHex(base['material']));
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(element['skeleton']), self.util.strUtf8ToHex(base['skeleton']));
            // 写入到working文件内
            self.util.writeHexFile(editPath, data);
            self.util.cancelAsyncEvent(editPath);
        });
    }

    // 所有working目录下的upk内的模型名都替换完成后
    self.util.startToListenAsyncList(function() {
        // 修改色指定文件，如果当前模型的col不是col1的话
        if (element['col'] !== 'col1') {
            self.util.registerAsyncEvent(paths['material']);
            self.util.readHexFile(paths['material'], function(data, colPath) {
                self.util.writeHexFile(colPath, self.util.replaceStrLast(
                    data,
                    self.util.strUtf8ToHex(element['col']), // 原始：替换目标模型的col
                    self.util.strUtf8ToHex('col1') // 目标：洪门道服永远是 col1
                ));
                self.util.cancelAsyncEvent(colPath);
            });
        } else {
            self.grunt.log.writeln('[BstReplace] Default material is col1, nothing to do.');
        }

        self.util.startToListenAsyncList(function() { // 色指定文件修改完成
            /**
             * 目前的换装构造，只允许替换洪门道服。
             * 洪门道服原本只存在bns文件夹下，而我们的换装永远是向tencent目录下放东西，
             * 即不会有文件被覆盖，只会有文件创建到tencent目录下，
             * 所以备份的时候只要写好backup.json配置文件就好
             */
            // 拷贝修改后的文件到tencent下，同时编辑备份列表，最后将working文件夹清空
            self.grunt.file.recurse('working', function(abspath, rootdir, subdir, filename) {
                /**
                 * 因为只有一层文件夹结构，所以不用担心多层嵌套问题
                 */
                if (filename === 'working_dir') { return; } // 忽略文件夹占位文件
                var targetTencentPath = path.join(self.util.getTencentPath(), filename);
                self.util.copyFile(abspath, targetTencentPath);
                self.util.deleteFile(abspath);
                if (self.backup['delete'].indexOf(abspath) === -1) { // 未存在于备份列表中
                    self.backup['delete'].push(abspath);
                }
            });
            // 将更新过的备份列表重新写回文件
            self.util.writeFile('./config/backup.json', self.util.formatJson(self.backup));
        });
    });
};

BstReplace.prototype.processFace = function() {

};

BstReplace.prototype.processHair = function() {

};

module.exports = BstReplace;