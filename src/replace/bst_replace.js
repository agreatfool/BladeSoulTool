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

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.tencentPath = path.join(this.conf['path']['game'], this.conf['path']['tencent']);
    this.bnsPath = path.join(this.conf['path']['game'], this.conf['path']['bns']);

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
    self.grunt.log.writeln('[BstReplace] Target conf read: ' + JSON.stringify(element));
    // 读取基本模型配置
    var base = self.base[element['race']];
    self.grunt.log.writeln('[BstReplace] Base conf read: ' + JSON.stringify(base));

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
    self.grunt.log.writeln('[BstReplace] Base upk path found: ' + JSON.stringify(paths));

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
        // 修改色指定文件，如果colorInputted不是col1的话
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
            // 备份文件，如果在backup里已经有同名文件的话，则忽略（因为最早已备份肯定是未被污染的）
            // TODO
            /**
             * 因为目前的换装构造，只允许替换洪门道服，所以不会有额外的upk文件添加到tencent下（都被重命名为洪门道服的upk了）
             * 所以备份的时候只要检查该种族的洪门道服有没有被备份就OK
             */
            for (var key in baseConf) {
                if (!baseConf.hasOwnProperty(key)
                    || ['Texture', 'Material', 'Skeleton'].indexOf(key) === -1) {
                    continue;
                }
                var upkName = ((key === 'Material') ? baseConf[key]['col1'] : baseConf[key]) + '.upk';
                var backupPath = path.join('backup', upkName);
                // 洪门道服只会在bns下才有，备份的时候将其拷贝到backup下，复原的时候只要删除tencent下对应的文件就好了
                if (!grunt.file.exists(backupPath)) {
                    self.util.copyFile(path.join(bnsPath, upkName), backupPath);
                } else {
                    self.grunt.log.writeln('Backup file already exists: ' + backupPath);
                }
            }

            // 08. 拷贝修改后的文件到tencent下，然后将working文件夹清空
            self.grunt.log.writeln('-------------------------------------------------------------------------------');
            self.grunt.log.writeln('08. Copy finished model resources to tencent dir & clear working dir: ');
            self.grunt.log.writeln('-------------------------------------------------------------------------------');
            self.grunt.file.recurse('working', function(abspath, rootdir, subdir, filename) {
                /**
                 * 因为只有一层文件夹结构，所以不用担心多层嵌套问题，注意要忽略 working_dir 这个占位文件
                 */
                if (filename === 'working_dir') { return; }
                self.util.copyFile(abspath, path.join(localPath, filename));
                self.util.deleteFile(abspath);
            });
        });
    });
};

BstReplace.prototype.processFace = function() {

};

BstReplace.prototype.processHair = function() {

};

module.exports = BstReplace;