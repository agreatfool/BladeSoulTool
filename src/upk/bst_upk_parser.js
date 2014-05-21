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

var BstUpkParser = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.upkIdsSkeleton = [];
    this.upkIdsTexture = [];
    this.upkIdsMaterial = [];

    /**
     * {
     *     "65045_JinF_col1": {
     *         "skeleton": "00010868",
     *         "texture": "00010866",
     *         "material": "00010867",
     *         "col1Material": "00010867",
     *         "col": "col1",
     *         "core": "65045_JinF",
     *         "code": "65045",
     *         "race": "JinF",
     *         "pic": "costume_65045_JinM_col2.png",
     *      },
     *      ...
     * }
     */
    this.db = {
        "costume": {},
        "attach": {},
        "weapon": {}
    };
    /**
     * {
     *     "65045": {
     *         "code": "65045",
     *         "notFound": ["skeleton", "texture", "material"],
     *         "invalid": ["skeleton", "material"]
     *     }
     * }
     */
    this.dbInvalid = {
        "costume": {},
        "attach": {},
        "weapon": {}
    };

    /**
     * {
     *     "010051": {
     *         "code": "010051",
     *         "races": [JinM, JinF, ...], // 当前code能找到的所有race信息
     *         "col": ["col1", "col2"], // 当前code能找到的所有col信息
     *         "colIcons": {
     *             "GonM_col1": "Attach_010022_GonM_col1.png", // 有带种族信息的话，完整放入一份，然后再在colX里也放一份
     *             "GonM_col2": "Attach_010022_GonM_col2.png",
     *             "col1": ["Attach_010022_GonM_col1.png", ...],
     *             "col2": ["Attach_010022_GonM_col2.png", ...],
     *             "GonM": "Attach_010022_GonM.png" // 这张图片其实并不存在，这里仅举例
     *         } // 首先选择种族、col都符合的，其次选择符合col的、再次选择符合种族的
     *     },
     *     ...
     * }
     */
    this.iconData = {
        "costume": {},
        "attach": {},
        "weapon": {}
    };
    /**
     * {
     *     "Attach_010002_JInM_col1": {
     *         "filename": "Attach_010002_JInM_col1",
     *         "notFound": ["code", "race", "col"]
     *     }
     * }
     */
    this.iconDataInvalid = {
        "costume": {},
        "attach": {},
        "weapon": {}
    };

    /**
     * {
     *    "00010868": {
     *         "upkId": "00010868",
     *         "code": "65045",
     *         "core": "65045_JinF", // Loading SkeletalMesh3 JinF_043 from package 00019951.upk => JinF_043
     *         "race": "JinF",
     *         "col1Material": "00010867",
     *         "texture": "00010866",
     *         "textureObjs": ["65045_JinF_N", "65045_JinF_M", "65045_JinF_D", "65045_JinF_S"],
     *     },
     *     ...
     * }
     */
    this.upkDataSkeleton = {};
    /**
     * {
     *     "00021612": {
     *         "upkId": "00021612",
     *         "notFound": ["texture", "col1Material"]
     *         "invalid": {
     *             "col1Material": "Acc_990097_GuardianShield_INST"
     *         }
     *     },
     *     ...
     * }
     */
    this.upkDataSkeletonInvalid = {};

    /**
     * {
     *     "00010866": {
     *         "upkId": "00010866",
     *         "objs": [
     *             "65045_JinF_D", "65045_JinF_M", "65045_JinF_N", "65045_JinF_S",
     *             "65045_JinF_col2_D", "65045_JinF_col2_M", "65045_JinF_col2_N", "65045_JinF_col2_S"
     *         ],
     *         "materials": {"col1": "00010867", "col2": "00019801"}
     *     },
     *     ...
     * }
     */
    this.upkDataTexture = {};

    /**
     * {
     *     "00010867": {
     *         "upkId": "00010867",
     *         "col": "col1",
     *         "texture": "00010866",
     *         "objs": ["65045_JinF_N", "65045_JinF_M", "65045_JinF_D", "65045_JinF_S"]
     *     },
     *     "00019801": {
     *         "upkId": "00019801",
     *         "col": "col2",
     *         "texture": "00010866",
     *         "objs": ["65045_JinF_col2_N", "65045_JinF_col2_M", "65045_JinF_col2_D", "65045_JinF_col2_S"]
     *     }
     * }
     */
    this.upkDataMaterial = {};
    /**
     * {
     *     "00021612": {
     *         "upkId": "00021612",
     *         "notFound": ["texture", "col"]
     *         "invalid": {
     *             "col": "Acc_990097_GuardianShield_INST"
     *         }
     *     },
     *     ...
     * }
     */
    this.upkDataMaterialInvalid = {};

    /**
     * 06.根据icon滤出来的列表，搜集信息，制作database，结构：
     * 武器等可能不同
     */
};

BstUpkParser.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkParser] Start to parse upk files ...');
    self.util.printHr();

    self.preProcess(); // 准备list数据，参考：database/upk/data/list/*

    self.preProcessIcon();
    self.preProcessSkeleton();
    self.preProcessTexture();
    self.preProcessMaterial();

    self.buildDatabase();
};

BstUpkParser.prototype.preProcess = function() {
    var self = this;

    var upkListSkeletonCostumeWithAttachment = {};
    var upkListSkeletonWeapon = {};
    var upkListSkeletonHair = {};
    var upkListSkeletonUnrecognized = {};
    var upkListTexture = {};
    var upkListMaterial = {};
    var upkListUnrecognized = {};

    self.grunt.log.writeln('[BstUpkParser] Pre process, prepare list data ...');
    self.util.printHr();

    self.grunt.file.recurse(BstConst.PATH_UPK_LOG, function(abspath, rootdir, subdir, filename) {
        if (filename !== 'upk_dir') {
            var upkId = filename.substr(0, filename.indexOf('.'));
            var content = self.util.readFile(abspath).toString().split("\r\n");
            var coreLineOfContent = content[BstConst.UPK_ENTRANCE_LINE_NO];

            if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_SKELETON)) !== null) {
                // skeleton
                if (coreLineOfContent.match(/\d+_(KunN|JinF|JinM|GonF|GonM|LynF|LynM)/i) !== null) {
                    // costume & attachment
                    self.upkIdsSkeleton.push(upkId);
                    upkListSkeletonCostumeWithAttachment[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/\d+_Autoscale/i) !== null) {
                    // weapon with autoscale
                    self.upkIdsSkeleton.push(upkId);
                    upkListSkeletonWeapon[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/Loading\sSkeletalMesh3\s(\d+)\sfrom\spackage\s\d+.upk/) !== null) {
                    // weapon with numeric id
                    self.upkIdsSkeleton.push(upkId);
                    upkListSkeletonWeapon[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM)_\d+/i) !== null) {
                    // hair
                    self.upkIdsSkeleton.push(upkId);
                    upkListSkeletonHair[upkId] = coreLineOfContent;
                } else {
                    upkListSkeletonUnrecognized[upkId] = coreLineOfContent;
                }
            } else if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_TEXTURE)) !== null) {
                // texture
                self.upkIdsTexture.push(upkId);
                upkListTexture[upkId] = coreLineOfContent;
            } else if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_MATERIAL)) !== null) {
                // material
                self.upkIdsMaterial.push(upkId);
                upkListMaterial[upkId] = coreLineOfContent;
            } else {
                // unrecognized
                upkListUnrecognized[upkId] = coreLineOfContent;
            }
        }
    });

    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_COSTUME_WITH_ATTACHMENT), self.util.formatJson(upkListSkeletonCostumeWithAttachment))
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_WEAPON), self.util.formatJson(upkListSkeletonWeapon));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_HAIR), self.util.formatJson(upkListSkeletonHair));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_UNRECOGNIZED), self.util.formatJson(upkListSkeletonUnrecognized));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_TEXTURE), self.util.formatJson(upkListTexture));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_MATERIAL), self.util.formatJson(upkListMaterial));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_UNRECOGNIZED), self.util.formatJson(upkListUnrecognized));
    self.util.printHr();

};

BstUpkParser.prototype.preProcessIcon = function() {
    var self = this;

    self.grunt.log.writeln('[BstUpkParser] Pre process icon files ...');
    self.util.printHr();

    self.grunt.file.recurse(BstConst.PATH_ICON_PNG_CPS, function(abspath, rootdir, subdir, filename) {
        var iconType = null;
        if (filename.match(/^attach.+/i)) {
            iconType = 'attach';
        } else if (filename.match(/^costume.+/i)) {
            iconType = 'costume';
        } else if (filename.match(/^weapon.+/i)) {
            iconType = 'weapon';
        } else {
            return; // 不是我们需要的icon，直接忽略
        }

        if (filename.match(/_\d+.png$/)) {
            return; // 当前icon文件是..._2.png这样的格式，这种格式一般是无意义的，忽略
        }

        // 准备数据
        var code = filename.match(/(\d+)/);
        if (code !== null) {
            code = code[1];
        } else {
            self.utilBuildIconInvalidInfo(iconType, filename);
            self.iconDataInvalid[iconType][filename]["notFound"].push('code');
            self.grunt.log.error('[BstUpkParser] Code not found in icon filename: ' + filename);
        }

        var race = filename.match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM|All)/i);
        if (race !== null) {
            race = self.util.formatRawCode(race[1]); // 转换大小写
        } else if (iconType !== 'weapon') { // 武器肯定是没有race信息的
            self.utilBuildIconInvalidInfo(iconType, filename);
            self.iconDataInvalid[iconType][filename]["notFound"].push('race');
            self.grunt.log.error('[BstUpkParser] Race not found in icon filename: ' + filename);
        }

        var col = filename.match(/(col\d+)/i);
        if (col !== null) {
            col = self.util.formatCol(col[1]);
        } else {
            self.utilBuildIconInvalidInfo(iconType, filename);
            self.iconDataInvalid[iconType][filename]["notFound"].push('col');
            self.grunt.log.error('[BstUpkParser] Col not found in icon filename: ' + filename);
        }

        if (code === null) {
            return; // 连code都没有的icon无法辨识，忽略
        }

        // 开始处理最终存储数据
        var iconData = null;
        if (self.iconData[iconType].hasOwnProperty(code)) {
            iconData = self.iconData[iconType][code];
        } else {
            iconData = {
                "code": code,
                "races": [],
                "col": [],
                "colIcons": {}
            };
        }
        if (race !== null && iconData['races'].indexOf(race) === -1) {
            iconData['races'].push(race);
        }
        if (col !== null && iconData['col'].indexOf(col) === -1) {
            iconData['col'].push(col);
        }
        // 处理带种族的icon数据
        if (race !== null && col !== null) {
            var iconKey = race + '_' + col;
            if (!iconData['colIcons'].hasOwnProperty(iconKey)) {
                iconData['colIcons'][iconKey] = filename;
            }
        }
        // 处理col的icon数据
        if (col !== null && !iconData['colIcons'].hasOwnProperty(col)) {
            iconData['colIcons'][col] = [];
        }
        if (col !== null && iconData['colIcons'][col].indexOf(filename) === -1) {
            iconData['colIcons'][col].push(filename);
        }
        // 处理race的icon数据
        if (race !== null && !iconData['colIcons'].hasOwnProperty(race)) {
            iconData['colIcons'][race] = filename;
        }

        // 重新赋值回去
        self.iconData[iconType][code] = iconData;

        self.grunt.log.writeln('[BstUpkParser] Pre process icon file: ' + filename + ' done');
        self.util.printHr();
    });

    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_ICON), self.util.formatJson(self.iconData));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_ICON_INVALID), self.util.formatJson(self.iconDataInvalid));
};

BstUpkParser.prototype.preProcessSkeleton = function() {
    var self = this;

    self.grunt.log.writeln('[BstUpkParser] Pre process skeleton upk data ...');
    self.util.printHr();

    if (self.upkIdsSkeleton.length == 0) {
        return;
    }

    var finishedCount = 0;

    _.each(self.upkIdsSkeleton, function(upkId) {
        self.grunt.log.writeln('[BstUpkParser] Pre process skeleton upk: ' + upkId);

        var upkLog = self.util.readFile(path.join(BstConst.PATH_UPK_LOG, upkId + '.log')).split("\r\n");

        /**
         * Loading SkeletalMesh3 65045_JinF from package 00010868.upk => 65045_JinF
         * Loading SkeletalMesh3 990031_autoscale from package 00004609.upk => 990031_autoscale
         * Loading SkeletalMesh3 JinF_043 from package 00019951.upk => JinF_043
         */
        var core = upkLog[BstConst.UPK_ENTRANCE_LINE_NO].match(/Loading\sSkeletalMesh3\s(.+)\sfrom\spackage\s\d+.upk/)[1];
        var code = core.match(/(\d+)/);
        if (code !== null) {
            code = code[1];
        } else {
            self.utilBuildSkeletonInvalidInfo(upkId);
            self.upkDataSkeletonInvalid[upkId]['notFound'].push('code');
            self.grunt.log.error('[BstUpkParser] Code not found in skeleton upk data: ' + upkId);
        }

        var race = core.match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM)/i);
        if (race !== null) {
            race = self.util.formatRawCode(race[1]); // 转换大小写
        } else {
            if (core.match(/\d+_Autoscale/i) !== null
                || upkLog[BstConst.UPK_ENTRANCE_LINE_NO].match(/Loading\sSkeletalMesh3\s(\d+)\sfrom\spackage\s\d+.upk/) !== null) {
                // 是武器upk，core信息里不包含race，正常
            } else {
                self.utilBuildSkeletonInvalidInfo(upkId);
                self.upkDataSkeletonInvalid[upkId]['notFound'].push('race');
                self.grunt.log.error('[BstUpkParser] Race not found in skeleton upk data: ' + upkId);
            }
        }

        var col1Material = null;
        _.each(upkLog, function(line) {
            var colMatch = line.match(/Loading\sMaterialInstanceConstant\s(.+)\sfrom\spackage\s(\d+).upk/);
            if (colMatch !== null && col1Material === null) { // 只记录第一个出现的sMaterialInstanceConstant的col id信息
                var colInfo = self.util.formatCol(colMatch[1]);
                col1Material = colMatch[2];
                if (colInfo.match(/col\d+/) === null) { // 会有很多情况下col信息是一个非"colX"的格式，这里我们仅打日志，不做处理
                    self.utilBuildSkeletonInvalidInfo(upkId);
                    self.upkDataSkeletonInvalid[upkId]['invalid']['col1Material'] = colInfo;
                    self.grunt.log.error('[BstUpkParser] Material info got with invalid format: ' + colInfo);
                }
            }
        });
        if (col1Material === null) {
            self.utilBuildSkeletonInvalidInfo(upkId);
            self.upkDataSkeletonInvalid[upkId]['notFound'].push('col1Material');
            self.grunt.log.error('[BstUpkParser] Material info not found in skeleton upk data: ' + upkId);
        }

        var textureId = null; // 真正的贴图upk的id
        var textureObjs = {}; // upkId => [object, object, ...]
        _.each(upkLog, function(line) {
            var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s(\d+).upk/);
            if (textureMatch !== null) {
                var textureObjId = textureMatch[1];
                var textureUpkId = textureMatch[2];
                if (textureId === null) {
                    textureId = textureUpkId; // 只记录第一个出现的Texture2D的upk id，这个一般来说是真正的贴图upk
                }
                if (!textureObjs.hasOwnProperty(textureUpkId)) {
                    textureObjs[textureUpkId] = [];
                }
                textureObjs[textureUpkId].push(textureObjId);
            }
        });
        textureObjs = textureObjs[textureId]; // 取出真正的贴图upk的objs
        if (textureId === null) {
            self.utilBuildSkeletonInvalidInfo(upkId);
            self.upkDataSkeletonInvalid[upkId]['notFound'].push('texture');
            self.grunt.log.error('[BstUpkParser] Texture info not found in skeleton upk data: ' + upkId);
        }

        self.upkDataSkeleton[upkId] = {
            "upkId": upkId,
            "code": code,
            "core": core,
            "race": race,
            "col1Material": col1Material,
            "texture": textureId,
            "textureObjs": textureObjs
        };
        finishedCount++;

        self.grunt.log.writeln('[BstUpkParser] Pre process skeleton upk: ' + upkId + ' done, progress: ' +
            finishedCount + ' / ' + self.upkIdsSkeleton.length);
        self.util.printHr();
    });

    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_SKELETON), self.util.formatJson(self.upkDataSkeleton));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_SKELETON_INVALID), self.util.formatJson(self.upkDataSkeletonInvalid));
};

BstUpkParser.prototype.preProcessTexture = function() {
    var self = this;

    self.grunt.log.writeln('[BstUpkParser] Pre process texture upk data ...');
    self.util.printHr();

    if (self.upkIdsTexture.length == 0) {
        return;
    }

    var finishedCount = 0;

    _.each(self.upkIdsTexture, function(upkId) {
        self.grunt.log.writeln('[BstUpkParser] Pre process skeleton upk: ' + upkId);

        var upkLog = self.util.readFile(path.join(BstConst.PATH_UPK_LOG, upkId + '.log')).split("\r\n");

        var objs = [];
        _.each(upkLog, function(line) {
            var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s\d+.upk/);
            if (textureMatch !== null) {
                objs.push(textureMatch[1]);
            }
        });
        if (objs.length == 0) {
            self.grunt.log.error('[BstUpkParser] Texture objs not found in texture upk data: ' + upkId);
        }

        self.upkDataTexture[upkId] = {
            "upkId": upkId,
            "objs": objs,
            "materials": {}
        };
        finishedCount++;

        self.grunt.log.writeln('[BstUpkParser] Pre process texture upk: ' + upkId + ' done, progress: ' +
            finishedCount + ' / ' + self.upkIdsTexture.length);
        self.util.printHr();
    });

    // 不要在这里写入文件，因为我们还没收集到material信息，需要在material那步收集
};

BstUpkParser.prototype.preProcessMaterial = function() {
    var self = this;

    self.grunt.log.writeln('[BstUpkParser] Pre process material upk data ...');
    self.util.printHr();

    if (self.upkIdsMaterial.length == 0) {
        return;
    }

    var finishedCount = 0;

    _.each(self.upkIdsMaterial, function(upkId) {
        self.grunt.log.writeln('[BstUpkParser] Pre process material upk: ' + upkId);

        var upkLog = self.util.readFile(path.join(BstConst.PATH_UPK_LOG, upkId + '.log')).split("\r\n");

        var colInfo = self.util.formatCol(
            upkLog[BstConst.UPK_ENTRANCE_LINE_NO].match(/Loading\sMaterialInstanceConstant\s(.+)\sfrom\spackage\s\d+.upk/)[1]
        );
        if (colInfo.match(/col\d+/) === null) { // 会有很多情况下col信息是一个非"colX"的格式，这里我们仅打日志，不做处理
            self.utilBuildMaterialInvalidInfo(upkId);
            self.upkDataMaterialInvalid[upkId]['invalid']['col'] = colInfo;
            self.grunt.log.error('[BstUpkParser] Material info got with invalid format: ' + colInfo);
        }

        var textureId = null; // 真正的贴图upk的id
        var textureObjs = {}; // upkId => [object, object, ...]
        _.each(upkLog, function(line) {
            var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s(\d+).upk/);
            if (textureMatch !== null) {
                var textureObjId = textureMatch[1];
                var textureUpkId = textureMatch[2];
                if (textureId === null) {
                    textureId = textureUpkId; // 只记录第一个出现的Texture2D的upk id，这个一般来说是真正的贴图upk
                }
                if (!textureObjs.hasOwnProperty(textureUpkId)) {
                    textureObjs[textureUpkId] = [];
                }
                textureObjs[textureUpkId].push(textureObjId);
            }
        });
        textureObjs = textureObjs[textureId]; // 取出真正的贴图upk的objs
        if (textureId === null) {
            self.utilBuildMaterialInvalidInfo(upkId);
            self.upkDataMaterialInvalid[upkId]['notFound'].push('texture');
            self.grunt.log.error('[BstUpkParser] Texture info not found in material upk data: ' + upkId);
        }

        self.upkDataMaterial[upkId] = {
            "upkId": upkId,
            "col": colInfo,
            "texture": textureId,
            "objs": textureObjs
        };
        if (textureId && self.upkDataTexture.hasOwnProperty(textureId)) {
            // 同时为对应的texture数据添加material信息
            self.upkDataTexture[textureId]['materials'][colInfo] = upkId;
        } else if (!self.upkDataTexture.hasOwnProperty(textureId)) {
            // 没有找到对应的texture数据
            self.utilBuildMaterialInvalidInfo(upkId);
            self.upkDataMaterialInvalid[upkId]['noTexture'] = textureId;
            self.grunt.log.error('[BstUpkParser] Corresponding texture data of upk "' + textureId + '" not found, material upk: ' + upkId);
        }
        finishedCount++;

        self.grunt.log.writeln('[BstUpkParser] Pre process material upk: ' + upkId + ' done, progress: ' +
            finishedCount + ' / ' + self.upkIdsMaterial.length);
        self.util.printHr();
    });

    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_TEXTURE), self.util.formatJson(self.upkDataTexture));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_MATERIAL), self.util.formatJson(self.upkDataMaterial));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_RAW, BstConst.RAW_FILE_MATERIAL_INVALID), self.util.formatJson(self.upkDataMaterialInvalid));
};

BstUpkParser.prototype.buildDatabase = function() {
    var self = this;

    self.grunt.log.writeln('[BstUpkParser] Start to build database ...');
    self.util.printHr();

    var buildTypeOfDatabase = function(type) {
        self.grunt.log.writeln('[BstUpkParser] Start to build ' + type + ' database ...');
        self.util.printHr();
        var totalCount = _.keys(self.iconData[type]).length;
        var finishedCount = 0;
        if (totalCount > 0) {
            _.each(self.iconData[type], function(data, code) {
                self.grunt.log.writeln('[BstUpkParser] Build ' + type + ' data: ' + code);
                self.buildData(type, code, data);
                finishedCount++;
                self.grunt.log.writeln('[BstUpkParser] Finish ' + type + ' data: ' + code +
                    ', progress: ' + finishedCount + ' / ' + totalCount);
                self.util.printHr();
            });
        }
        //TODO 打结束日志，并写入data文件
    };

    var types = ["costume", "attach", "weapon"];
    _.each(types, function(type) {
        buildTypeOfDatabase(type);
    });
};

BstUpkParser.prototype.buildData = function(type, code, iconData) {
    var self = this;

    // 根据code，滤出skeleton数据
    var skeletons = [];
    _.each(self.upkDataSkeleton, function(data) {
        if (data['code'] == code) {
            skeletons.push(data);
        }
    });
    if (skeletons.length === 0) {
        self.utilBuildDataInvalidInfo(type, code);
        self.dbInvalid[type][code]['notFound'].push('skeleton');
        self.grunt.log.error('[BstUpkParser] Skeleton data not found, code: ' + code);
        return; // 没必要继续处理下去了
    } else {
        _.each(skeletons, function(data) {
            if (self.upkDataSkeletonInvalid.hasOwnProperty(data['upkId'])) {
                // 这个skeleton有错误数据，记录下
                self.utilBuildDataInvalidInfo(type, code);
                self.dbInvalid[type][code]['invalid'].push('skeleton');
                self.grunt.log.error('[BstUpkParser] Skeleton has invalid data, code: ' + code + ', upkId: ' + data['upkId']);
            }
        });
    }

    _.each(skeletons, function(skeletonData) { // 轮询所有查询到的skeleton数据
        var skeletonId = skeletonData['upkId'];
        // 根据skeleton数据，获得texture数据
        var textureId = skeletonData['texture'];
        var textureData = null;
        if (self.upkDataTexture.hasOwnProperty(textureId)) {
            textureData = self.upkDataTexture[textureId];
        } else {
            self.utilBuildDataInvalidInfo(type, code);
            self.dbInvalid[type][code]['notFound'].push('skeleton:' + skeletonId + ',texture:' + textureId);
            self.grunt.log.error('[BstUpkParser] Texture data not found, code: ' + code +
                ', skeleton: ' + skeletonId + ', texture: ' + textureId);
            return; // 这个skeleton没必要处理下去了，因为缺失texture
        }

        // 检查texture数据
        if (_.keys(textureData['materials']).length == 0) {
            self.utilBuildDataInvalidInfo(type, code);
            self.dbInvalid[type][code]['invalid'].push('skeleton:' + skeletonId + ',texture:' + textureId);
            self.grunt.log.error('[BstUpkParser] Texture has invalid data, code: ' + code +
                ', skeleton: ' + skeletonId + ', texture: ' + textureId);
            return; // 当前的texture没有对应的material
        }

        // 根据texture数据，获得相关的materials列表和数据
        var materials = textureData['materials']; // colX : upkId

        // 组装数据
        _.each(materials, function(col, materialId) { // 轮询所有的materials数据
            // 检查material数据
            if (self.upkDataMaterialInvalid.hasOwnProperty(materialId)) {
                self.utilBuildDataInvalidInfo(type, code);
                self.dbInvalid[type][code]['invalid'].push('skeleton:' + skeletonId + ',texture:' + textureId + ',material:' + materialId);
                self.grunt.log.error('[BstUpkParser] Material has invalid data, code: ' + code +
                    ', skeleton: ' + skeletonId + ', texture: ' + textureId + ', material: ' + materialId);
                return; // 当前的material有错误数据
            }
//TODO
            // 选取图片
            var pic = null;

            // 写入数据
            self.db[type][skeletonData['core'] + '_' + col] = {
                "skeleton": skeletonId,
                "texture": textureId,
                "material": materialId,
                "col1Material": skeletonData['col1Material'],
                "col": col,
                "core": skeletonData['core'],
                "code": code,
                "race": skeletonData['race'],
                "pic": pic
            };
        });
    });
};
/**
 * {
 *     "65045_JinF_col1": {
 *         "skeleton": "00010868",
 *         "texture": "00010866",
 *         "material": "00010867",
 *         "col1Material": "00010867",
 *         "col": "col1",
 *         "core": "65045_JinF",
 *         "code": "65045",
 *         "race": "JinF",
 *         "pic": "costume_65045_JinM_col2.png",
 *      },
 *      ...
 * }
 */

BstUpkParser.prototype.utilBuildSkeletonInvalidInfo = function(upkId) {
    if (!this.upkDataSkeletonInvalid.hasOwnProperty(upkId)) {
        this.upkDataSkeletonInvalid[upkId] = {
            "upkId": upkId,
            "notFound": [],
            "invalid": {}
        };
    }
};

BstUpkParser.prototype.utilBuildMaterialInvalidInfo = function(upkId) {
    if (!this.upkDataMaterialInvalid.hasOwnProperty(upkId)) {
        this.upkDataMaterialInvalid[upkId] = {
            "upkId": upkId,
            "notFound": [],
            "invalid": {},
            "noTexture": null
        };
    }
};

BstUpkParser.prototype.utilBuildIconInvalidInfo = function(iconType, filename) {
    if (!this.iconDataInvalid[iconType].hasOwnProperty(filename)) {
        this.iconDataInvalid[iconType][filename] = {
            "filename": filename,
            "notFound": []
        }
    }
};

BstUpkParser.prototype.utilBuildDataInvalidInfo = function(dataType, code) {
    if (!this.dbInvalid[dataType].hasOwnProperty(code)) {
        this.dbInvalid[dataType][code] = {
            "code": code,
            "notFound": [],
            "invalid": []
        };
    }
};

module.exports = BstUpkParser;