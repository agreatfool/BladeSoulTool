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

var BstReplace = function(grunt, done) {
    this.grunt    = grunt;
    this.util     = new BstUtil(grunt);
    this.taskDone = done; // notify grunt: tasks done

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
    this.util.printHr();

    this.process();
};

BstReplace.prototype.process = function() {
    switch (this.part) {
        case BstConst.PART_TYPE_COSTUME:
            this.processCostumeAndAttach();
            break;
        case BstConst.PART_TYPE_ATTACH:
            this.processCostumeAndAttach();
            break;
        case BstConst.PART_TYPE_WEAPON:
            this.processWeapon();
            break;
        default:
            break;
    }
};

BstReplace.prototype.processCostumeAndAttach = function() {
    var self = this;

    // 准备目标模型upk路径，并验证存在，只需要骨骼和材质文件
    var paths = {
        "skeleton": self.util.findUpkPath(self.targetModelInfo['skeleton']),
        "material": self.util.findUpkPath(self.targetModelInfo['material'])
    };
    // 检查路径
    for (var checkKey in paths) {
        if (!paths.hasOwnProperty(checkKey)) {
            continue;
        }
        if (paths[checkKey] === null) {
            // 如果upk没找到，直接失败，并报错给子进程，这样才能返回信息给客户端
            self.grunt.fail.fatal('[BstReplace] upk file of target model not found, id: ' + self.targetModelInfo[checkKey] + '.upk');
        }
    }
    // 检查原始模型是否为头发（被替换的目标），如果是的话，材质upk是不需要的
    if (self.originModelInfo['core'].match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM)_\d+/i) !== null) {
        delete paths['material'];
    }
    self.grunt.log.writeln('[BstReplace] All upk files of target model found: ' + self.util.formatJson(paths));

    // 拷贝目标upk到working路径下，并重命名为原始模型的upk名
    _.each(paths, function(copyPath, copyKey) {
        var workingPath = path.join('working', self.originModelInfo[copyKey] + '.upk');
        self.util.copyFile(copyPath, workingPath);
        paths[copyKey] = workingPath;
    });
    self.util.printHr();

    // 修改内容
    for (var editKey in paths) { // skeleton | material
        if (!paths.hasOwnProperty(editKey)) {
            continue;
        }
        self.util.registerAsyncEvent(paths[editKey]);
        self.util.readHexFile(paths[editKey], function(data, editPath) {
            var editPart = _.keys(paths.findByVal(editPath)).shift(); // skeleton | material
            self.grunt.log.writeln('[BstReplace] Start to handle "' + editPart + '" file: ' + editPath);

            if (editPart === 'skeleton') {
                // 骨骼内容修改
                var targetCore = self.targetModelInfo['core'];
                var originCore = self.originModelInfo['core'];

                // 替换头发的话，有几个模型的规则和普通的不通，需要添加前缀 "Hair_"
                targetCore = self.util.buildSpecialHairCore(targetCore);
                originCore = self.util.buildSpecialHairCore(originCore);
                self.grunt.log.writeln('[BstReplace] Target Core: ' + targetCore);
                self.grunt.log.writeln('[BstReplace] Origin Core: ' + originCore);

                // 获取目标模型核心名（即会被替换掉的）在文件中出现次数，之后可能会用来计算长度差
                var targetCoreFoundCount = self.util.findStrCount(data, self.util.buildHexCoreStrWithHexNull(targetCore));
                var targetCorePhysicsFoundCount = self.util.findStrCount(data, self.util.buildHexCoreStrWithHexNull(targetCore + BstConst.UPK_CORE_PHYSICS_SUFFIX));
                self.grunt.log.writeln('[BstReplace] Target core found times: ' + targetCoreFoundCount);
                self.grunt.log.writeln('[BstReplace] Target core with Physics found times: ' + targetCorePhysicsFoundCount);

                // 计算双方核心名的长度差异，因为转换是从目标模型的模型名转换为原始模型的模型名
                // 这里 delta 是：目标长度 - 原始长度
                // delta：
                // = 0：表示双方长度一致，不需要额外操作
                // < 0：表示目标长度比原始长度短，修改完成文件长度会变长（短改长：需要额外操作删掉upk内部分内容）
                // > 0：表是目标长度比原始长度长，修改完成文件长度会变短（长改短：需要额外操作以HEX空字符补足长度）
                var delta = targetCore.length - originCore.length;
                self.grunt.log.writeln('[BstReplace] Core delta: ' + delta);

                if (delta == 0) {
                    self.grunt.log.writeln('[BstReplace] Normal edit ...');
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore), self.util.buildHexCoreStrWithHexNull(originCore));
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore + BstConst.UPK_CORE_PHYSICS_SUFFIX), self.util.buildHexCoreStrWithHexNull(originCore + BstConst.UPK_CORE_PHYSICS_SUFFIX));
                } else if (delta < 0) {
                    self.grunt.log.writeln('[BstReplace] Short to long edit ...');
                    var shortenLength = Math.abs(delta * (targetCoreFoundCount + targetCorePhysicsFoundCount));
                    if (shortenLength > BstConst.UPK_REPLACE_SHORT_TO_LONG_LIMIT) {
                        self.grunt.fail.fatal('[BstReplace] Upk replacement character length change exceed the limit, from origin core: ' + originCore + ', to target core: ' + targetCore);
                    }
                    // 修改文件内容
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore), self.util.buildHexCoreStrWithHexNull(originCore));
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore + BstConst.UPK_CORE_PHYSICS_SUFFIX), self.util.buildHexCoreStrWithHexNull(originCore + BstConst.UPK_CORE_PHYSICS_SUFFIX));
                    // 修改长度
                    var upkFileNameCanbeModified = self.targetModelInfo[editPart];
                    var shortenedName = '';
                    for (var i = 0; i < BstConst.UPK_REPLACE_SHORT_TO_LONG_LIMIT - shortenLength; i++) {
                        shortenedName += '0'; // 改短的占位名无所谓什么内容，用字符串0来占位
                    }
                    self.grunt.log.writeln('[BstReplace] Shorten upk file name from: ' + upkFileNameCanbeModified + ', to: ' + shortenedName);
                    data = self.util.replaceStrAll(data, self.util.strUtf8ToHex(upkFileNameCanbeModified), self.util.strUtf8ToHex(shortenedName));
                } else if (delta > 0) {
                    self.grunt.log.writeln('[BstReplace] Long to short edit ...');
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore), self.util.buildHexCoreStrWithHexNull(originCore, delta));
                    data = self.util.replaceStrAll(data, self.util.buildHexCoreStrWithHexNull(targetCore + BstConst.UPK_CORE_PHYSICS_SUFFIX), self.util.buildHexCoreStrWithHexNull(originCore + BstConst.UPK_CORE_PHYSICS_SUFFIX, delta));
                }
                // 写入文件
                self.util.writeHexFile(editPath, data);
            }
            // 完成操作
            self.util.cancelAsyncEvent(editPath);
            self.util.printHr();
        });
    }

    // 所有working目录下的upk内的模型名都替换完成后
    self.util.startToListenAsyncList(function() {
        // 拷贝修改后的文件到tencent下，同时编辑备份列表，最后将working文件夹清空
        self.grunt.file.recurse('working', function(abspath, rootdir, subdir, filename) {
            /**
             * 因为只有一层文件夹结构，所以不用担心多层嵌套问题
             */
            if (filename === 'working_dir') { return; } // 忽略占位文件
            var targetTencentPath = path.join(self.util.getTencentPath(), filename); // 目标文件位置
            var targetTencentBackupPath = self.util.getBackupFilePathViaOriginPath(targetTencentPath); // 目标文件的备份位置
            if (self.grunt.file.exists(targetTencentBackupPath)) {
                // 已经存在备份，直接覆盖。有备份文件，则肯定在backup.json里有数据
                self.util.copyFile(abspath, targetTencentPath);
                self.util.deleteFile(abspath);
            } else {
                // 没有备份文件
                if (self.grunt.file.exists(targetTencentPath) // 文件已经存在
                    && self.backup['delete'].indexOf(targetTencentPath) === -1) { // 未存在于删除列表中
                    // 表示游戏系统中该文件本来就存在，备份文件，并保存回滚信息
                    self.util.backupFile(targetTencentPath);
                    self.util.copyFile(abspath, targetTencentPath);
                    self.util.deleteFile(abspath);
                    self.backup['restore'].push(targetTencentBackupPath);
                } else if (self.grunt.file.exists(targetTencentPath) // 文件已经存在
                    && self.backup['delete'].indexOf(targetTencentPath) !== -1) { // 存在于删除列表中
                    // 表示该文件是前次替换时拷贝过来的，直接覆盖，不需要保存删除信息
                    self.util.copyFile(abspath, targetTencentPath);
                    self.util.deleteFile(abspath);
                } else {
                    // 文件不存在，保存删除信息
                    self.util.copyFile(abspath, targetTencentPath);
                    self.util.deleteFile(abspath);
                    self.backup['delete'].push(targetTencentPath);
                }
            }
        });
        // 将更新过的备份列表重新写回文件
        self.util.writeFile('./config/backup.json', self.util.formatJson(self.backup));
        self.taskDone();
    });
};

BstReplace.prototype.processWeapon = function() {

};

module.exports = BstReplace;