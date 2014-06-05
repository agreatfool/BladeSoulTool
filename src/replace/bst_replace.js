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
    this.gruntWorkingPath = process.cwd();

    this.backup = this.util.readJsonFile('./config/backup.json');

    this.part = null; // 当前替换的是哪个部分的模型：costume、attach、weapon
    this.targetModelInfo = {}; // 目标模型数据，来自：database/[costume|attach|weapon]/data/data.json
    this.originModelInfo = {}; // 原始模型数据，来自：database/[costume|attach|weapon]/data/origin.json
};

BstReplace.prototype.start = function(part, race, modelId) {
    this.util.printHr();
    this.grunt.log.writeln('[BstReplace] Start to replace model of part: "' + part + '", race: "' +
        race + '", targetModelId: "' + modelId);
    this.util.printHr();

    this.util.partTypeCheck(part);

    this.part = part;
    var dataCollection = this.util.readJsonFile('./database/' + this.part + '/data/data.json');
    var modelIds = _.keys(dataCollection);

    // 确定替换目标模型数据
    if (!modelIds.indexOf(modelId)) {
        this.grunt.fail.fatal('[BstReplace] Invalid target model id specified: ' + modelId);
    } else {
        this.targetModelInfo = dataCollection[modelId];
        this.grunt.log.writeln('[BstReplace] Target model info read: ' + this.util.formatJson(this.targetModelInfo));
    }

    // 确定原始模型数据
    var originCollection = this.util.readJsonFile('./database/' + this.part + '/data/origin.json');
    if (part === BstConst.PART_TYPE_COSTUME || part === BstConst.PART_TYPE_ATTACH) { // 替换时装 或 饰品
        if (race === null) { // 没有提供种族信息
            this.grunt.fail.fatal('[BstReplace] No race info given when replace costume | attach ...');
        } else {
            if (!originCollection.hasOwnProperty(race) || !originCollection[race].hasOwnProperty('data')) { // 没有找到原始模型信息
                this.grunt.fail.fatal('[BstReplace] No origin model info set ...');
            } else {
                this.originModelInfo = originCollection[race]['data'];
                this.grunt.log.writeln('[BstReplace] Origin model info read: ' + this.util.formatJson(this.originModelInfo));
            }
        }
    } else {
        if (!originCollection.hasOwnProperty('data')) { // 没有找到原始模型信息
            this.grunt.fail.fatal('[BstReplace] No origin model info set ...');
        } else {
            this.originModelInfo = originCollection['data'];
            this.grunt.log.writeln('[BstReplace] Origin model info read: ' + this.util.formatJson(this.originModelInfo));
        }
    }

    this.process();
};

BstReplace.prototype.process = function() {
    switch (this.part) {
        case BstConst.PART_TYPE_COSTUME:
            this.processCostume();
            break;
        case BstConst.PART_TYPE_ATTACH:
            this.processAttach();
            break;
        case BstConst.PART_TYPE_WEAPON:
            this.processWeapon();
            break;
        default:
            break;
    }
};

BstReplace.prototype.processCostume = function() {
    var self = this;

    // 准备目标模型upk路径，并验证存在
    var paths = {
        "skeleton": self.util.findUpkPath(self.targetModelInfo['skeleton']),
        "texture":  self.util.findUpkPath(self.targetModelInfo['texture']),
        "material": self.util.findUpkPath(self.targetModelInfo['material'])
    };
    for (var checkKey in paths) {
        if (!paths.hasOwnProperty(checkKey)) {
            continue;
        }
        if (paths[checkKey] === null) { // 如果upk没找到，直接失败，并报错给子进程，这样才能返回信息给客户端
            self.grunt.fail.fatal('[BstReplace] upk file of target model not found, id: ' + self.targetModelInfo[checkKey] + '.upk');
        }
    }
    self.grunt.log.writeln('[BstReplace] All upk files of target model found: ' + self.util.formatJson(paths));

    // 拷贝目标upk到working路径下，并重命名为目标模型的upk名
    _.each(paths, function(copyPath, copyKey) {
        var workingPath = path.join('working', self.originModelInfo[copyKey] + '.upk');
        self.util.copyFile(copyPath, workingPath);
        paths[copyKey] = workingPath;
    });

    // 修改内容
    for (var editKey in paths) { // skeleton, texture, material
        if (!paths.hasOwnProperty(editKey)) {
            continue;
        }
        self.util.registerAsyncEvent(paths[editKey]);
        self.util.readHexFile(paths[editKey], function(data, editPath) {
            // 拷贝过来的文件内原来的：目标服装模型名 => 改为原始服装的模型名
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(self.targetModelInfo['core']), self.util.strUtf8ToHex(self.originModelInfo['core']));
            // 替换各upk的id名，包括texture, material, skeleton
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(self.targetModelInfo['texture']), self.util.strUtf8ToHex(self.originModelInfo['texture']));
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(self.targetModelInfo['material']), self.util.strUtf8ToHex(self.originModelInfo['material']));
            data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(self.targetModelInfo['skeleton']), self.util.strUtf8ToHex(self.originModelInfo['skeleton']));
            // 如果是多色模型的material的话，还需要修改当前模型的col
            var editPart = _.keys(paths.findByVal(editPath)).shift();
            if (editPart == 'material' && 'col1' !== self.targetModelInfo['col']) {
                data = self.util.replaceStrLast(
                    data,
                    self.util.strUtf8ToHex(self.targetModelInfo['col']), // 原始：替换目标模型的col
                    self.util.strUtf8ToHex('col1') // 目标：永远是 col1，只允许替换为col1的服装
                );
            }
            // 写入到working文件内
            self.util.writeHexFile(editPath, data);
            self.util.cancelAsyncEvent(editPath);
        });
    }

    // 所有working目录下的upk内的模型名都替换完成后
    self.util.startToListenAsyncList(function() {
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
            if (filename === 'working_dir') { return; } // 忽略占位文件
            var targetTencentPath = path.join(self.util.getTencentPath(), filename);
            self.util.copyFile(abspath, targetTencentPath);
            self.util.deleteFile(abspath);
            if (self.backup['delete'].indexOf(targetTencentPath) === -1) { // 未存在于备份列表中
                self.backup['delete'].push(targetTencentPath);
            }
        });
        // 将更新过的备份列表重新写回文件
        self.util.writeFile('./config/backup.json', self.util.formatJson(self.backup));
    });
};

BstReplace.prototype.processAttach = function() {

};

BstReplace.prototype.processWeapon = function() {

};

module.exports = BstReplace;