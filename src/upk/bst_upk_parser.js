"use strict";

var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var _ = require('underscore');
var xml2js = require('xml2js');

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
    this.parser = new xml2js.Parser();

    this.meshXml = [];

    this.upkIdsSkeleton = [];
    this.upkIdsTexture = [];
    this.upkIdsMaterial = [];
    this.upkSkeletonTypes = {}; // { upkId: "costume", upkId: "attach", upkId: "weapon", ... }

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

    var meshData = self.util.readFile(BstConst.PATH_MESH_XML);
    self.parser.parseString(meshData, function(err, result) {
        if (err) {
            self.grunt.fail.fatal('[BstUpkParser] Error in parsing mesh.xml: ' + err.stack);
        }
        self.meshXml = result['table']['record'];
        self.grunt.log.writeln('[BstUpkParser] mesh.xml parsed, "' + self.meshXml.length + '" lines of records read.');

        self.preProcessIcon();

        self.preProcess(); // 准备list数据，参考：database/upk/data/list/*

        self.preProcessSkeleton();
        self.preProcessTexture();
        self.preProcessMaterial();

        self.buildDatabase();
    });
};

BstUpkParser.prototype.preProcess = function() {
    var self = this;

    var upkListSkeletonCostume = {};
    var upkListSkeletonAttach = {};
    var upkListSkeletonWeapon = {};
    var upkListSkeletonUnrecognized = {};
    var upkListTexture = {};
    var upkListMaterial = {};
    var upkListUnrecognized = {};

    self.grunt.log.writeln('[BstUpkParser] Pre process, prepare list data ...');
    self.util.printHr();

    self.grunt.file.recurse(BstConst.PATH_UPK_LOG, function(abspath, rootdir, subdir, filename) {
        if (filename === 'upk_dir') {
            return; // 忽略占位文件
        }
        var upkId = filename.substr(0, filename.indexOf('.'));
        var upkLog = self.util.readFileSplitWithLineBreak(abspath);
        var coreLineOfContent = upkLog[BstConst.UPK_ENTRANCE_LINE_NO];

        if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_SKELETON)) !== null) {
            // skeleton
            var skeletonType = self.utilRecognizeSkeletonType(upkId, upkLog);

            if (skeletonType == BstConst.PART_TYPE_COSTUME) {
                // costume
                self.upkIdsSkeleton.push(upkId);
                self.upkSkeletonTypes[upkId] = BstConst.PART_TYPE_COSTUME;
                upkListSkeletonCostume[upkId] = coreLineOfContent;
            } else if (skeletonType == BstConst.PART_TYPE_ATTACH) {
                // attach
                self.upkIdsSkeleton.push(upkId);
                self.upkSkeletonTypes[upkId] = BstConst.PART_TYPE_ATTACH;
                upkListSkeletonAttach[upkId] = coreLineOfContent;
            } else if (skeletonType == BstConst.PART_TYPE_WEAPON) {
                // weapon
                self.upkIdsSkeleton.push(upkId);
                self.upkSkeletonTypes[upkId] = BstConst.PART_TYPE_WEAPON;
                upkListSkeletonWeapon[upkId] = coreLineOfContent;
            } else {
                // unrecognized
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
    });

    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_COSTUME), self.util.formatJson(upkListSkeletonCostume));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_ATTACH), self.util.formatJson(upkListSkeletonAttach));
    self.util.writeFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_WEAPON), self.util.formatJson(upkListSkeletonWeapon));
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
        // 处理洪门道服的icon，因为洪门道服的默认icon是"costume_startzone_jeja.png"，格式不是标准格式，需要特殊处理
        if (code === '60054') {
            var startzoneJejaIconName = 'costume_startzone_jeja.png';
            if (!iconData['colIcons'].hasOwnProperty('All_col1')) {
                iconData['colIcons']['All_col1'] = startzoneJejaIconName;
            }
            if (!iconData['colIcons'].hasOwnProperty('All')) {
                iconData['colIcons']['All'] = startzoneJejaIconName;
            }
            if (!iconData['colIcons'].hasOwnProperty('col1')) {
                iconData['colIcons']['col1'] = [startzoneJejaIconName];
            } else if (iconData['colIcons'].hasOwnProperty('col1')
                && iconData['colIcons']['col1'].indexOf(startzoneJejaIconName) === -1) {
                iconData['colIcons']['col1'].push(startzoneJejaIconName);
            }
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

        var upkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, upkId + '.log'));

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
            if (colMatch !== null && col1Material === null) { // 只记录第一个出现的MaterialInstanceConstant的col id信息
                var colInfo = self.util.formatCol(colMatch[1]);
                col1Material = colMatch[2];
                if (colInfo.match(/col\d+/) === null) { // 会有很多情况下col信息是一个非"colX"的格式，这里我们仅打日志，不做处理
                    /**
                     * UPDATE: 这里不再打log，应该可以在后续应用的时候进行处理
                     * self.utilBuildSkeletonInvalidInfo(upkId);
                     * self.upkDataSkeletonInvalid[upkId]['invalid']['col1Material'] = colInfo;
                     * self.grunt.log.error('[BstUpkParser] Material info got with invalid format: ' + colInfo);
                     */
                }
            }
        });

        var textureId = null; // 真正的贴图upk的id
        var textureObjs = {}; // upkId => [object, object, ...]
        _.each(upkLog, function(line) {
            var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s(\d+).upk/);
            if (textureMatch !== null) {
                var textureObjId = textureMatch[1];
                var textureUpkId = textureMatch[2];
                if (textureId === null // 只记录第一个出现的Texture2D的upk id
                    && BstConst.UPK_INVALID_TEXTURE_UPK_IDS.indexOf(textureUpkId) === -1) { // 且该upk id并不在黑名单上
                    textureId = textureUpkId;
                }
                if (!textureObjs.hasOwnProperty(textureUpkId)) {
                    textureObjs[textureUpkId] = [];
                }
                textureObjs[textureUpkId].push(textureObjId);
            }
        });
        textureObjs = textureObjs[textureId]; // 取出真正的贴图upk的objs

        if (col1Material === null && textureId === null) {
            // 材质和贴图都没有找到，说明该upk解析出错，尝试从mesh.xml里查找数据进行修复
            var element = self.utilSearchMeshXmlViaSkeletonId(upkId);
            // 查找该条mesh.xml数据中有没有col1Material材质配置，注意：这里我们只需要col1
            if (element !== null && element['$'].hasOwnProperty('sub-material-name-1')) {
                /**
                 * 一般来说 sub-material-name-x 字段里的内容都是工整的：00017534.col14 这样的格式
                 * 但是也会有例外：
                 * 00014113.Cloth_60018_JinM_col1.col11
                 * 00019714.col1_Fur
                 * 00010543.Col3
                 * INTRO_PK.DochunPung_Wet_INST
                 * 60002_GonM_col3
                 * 这样奇怪的格式，所以这里要处理
                 */
                var split = element['$']['sub-material-name-1'].split('.');
                var splitMaterialUpkId = null; // 解析出来的upk文件名

                if (split.length >= 2 // 字段个数必须大于等于2，否则非法，e.g 60002_GonM_col3
                    && split[0].match(/\d+/) !== null) { // 第一段理论上应该是upk id，如果不是，也非法，e.g INTRO_PK.DochunPung_Wet_INST
                    splitMaterialUpkId = split[0];
                }

                var splitTextureUpkId = null;
                var splitTextureObjs = {};
                if (splitMaterialUpkId !== null) {
                    // 这里我们还是不知道texture的upk id，mesh.xml里没有描述贴图信息，需要分析刚才解析出来的material upk log
                    var materialUpkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, splitMaterialUpkId + '.log'));
                    _.each(materialUpkLog, function(line) {
                        var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s(\d+).upk/);
                        if (textureMatch !== null) {
                            var textureObjId = textureMatch[1];
                            var textureUpkId = textureMatch[2];
                            if (splitTextureUpkId === null // 只记录第一个出现的Texture2D的upk id
                                && BstConst.UPK_INVALID_TEXTURE_UPK_IDS.indexOf(textureUpkId) === -1) { // 且该upk id并不在黑名单上
                                splitTextureUpkId = textureUpkId;
                            }
                            if (!splitTextureObjs.hasOwnProperty(textureUpkId)) {
                                splitTextureObjs[textureUpkId] = [];
                            }
                            splitTextureObjs[textureUpkId].push(textureObjId);
                        }
                    })
                }

                if (splitMaterialUpkId !== null && splitTextureUpkId !== null) {
                    // 说明我们的补救数据都到位了
                    col1Material = splitMaterialUpkId;
                    textureId = splitTextureUpkId;
                    textureObjs = splitTextureObjs;
                }
            }
        }
        // 在mesh.xml补救之后再检查col1Material和textureId
        if (col1Material === null) {
            self.utilBuildSkeletonInvalidInfo(upkId);
            self.upkDataSkeletonInvalid[upkId]['notFound'].push('col1Material');
            self.grunt.log.error('[BstUpkParser] Material info not found in skeleton upk data: ' + upkId);
        }
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

        var upkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, upkId + '.log'));

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

        var upkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, upkId + '.log'));

        var colInfo = self.util.formatCol( // 先读取核心行的数据，查找colInfo
            upkLog[BstConst.UPK_ENTRANCE_LINE_NO].match(/Loading\sMaterialInstanceConstant\s(.+)\sfrom\spackage\s\d+.upk/)[1]
        );
        if (colInfo.match(/col\d+/) === null) { // 会有很多情况下核心col信息是一个非"colX"的格式，循环查询后续的行内容，直到找到我们要的内容
            _.each(upkLog, function(line) {
                var coreMatch = line.match(/Loading\sMaterialInstanceConstant\s(.+)\sfrom\spackage\s\d+.upk/);
                if (coreMatch !== null && self.util.formatCol(coreMatch[1]).match(/col\d+/) !== null) {
                    colInfo = self.util.formatCol(coreMatch[1]);
                }
            });
            if (colInfo.match(/col\d+/) === null) { // 仍旧未找到我们需要的colInfo
                /**
                 * UPDATE: 这里不再打log，应该可以在后续应用的时候进行处理
                 * self.utilBuildMaterialInvalidInfo(upkId);
                 * self.upkDataMaterialInvalid[upkId]['invalid']['col'] = colInfo;
                 * self.grunt.log.error('[BstUpkParser] Material info got with invalid format: ' + colInfo);
                 */
            }
        }

        var textureId = null; // 真正的贴图upk的id
        var textureObjs = {}; // upkId => [object, object, ...]
        _.each(upkLog, function(line) {
            var textureMatch = line.match(/Loading\sTexture2D\s(.+)\sfrom\spackage\s(\d+).upk/);
            if (textureMatch !== null) {
                var textureObjId = textureMatch[1];
                var textureUpkId = textureMatch[2];
                if (textureId === null // 只记录第一个出现的Texture2D的upk id
                    && BstConst.UPK_INVALID_TEXTURE_UPK_IDS.indexOf(textureUpkId) === -1) { // 且该upk id并不在黑名单上
                    textureId = textureUpkId;
                }
                if (!textureObjs.hasOwnProperty(textureUpkId)) {
                    textureObjs[textureUpkId] = [];
                }
                textureObjs[textureUpkId].push(textureObjId);
            }
        });
        textureObjs = textureObjs[textureId]; // 取出真正的贴图upk的objs
        if (textureId === null) {
            // 查找是否有某个skeleton在使用当前的material upk，如果找到，才记录错误信息
            var foundMaterialUsage = false;
            _.each(self.upkDataSkeleton, function(element) {
                if (element['col1Material'] == upkId) {
                    foundMaterialUsage = true;
                }
            });
            if (foundMaterialUsage) {
                self.utilBuildMaterialInvalidInfo(upkId);
                self.upkDataMaterialInvalid[upkId]['notFound'].push('texture');
                self.grunt.log.error('[BstUpkParser] Texture info not found in material upk data: ' + upkId);
            }
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

    var totalCount = _.keys(self.upkDataSkeleton).length;
    var finishedCount = 0;

    // 循环构造数据
    _.each(self.upkDataSkeleton, function(skeletonData, skeletonKey) {
        self.buildData(skeletonData);
        finishedCount++;
        self.grunt.log.writeln('[BstUpkParser] Finish data build of skeleton: ' + skeletonKey +
            ', progress: ' + finishedCount + ' / ' + totalCount);
        self.util.printHr();
    });

    // 写入数据
    var types = ["costume", "attach", "weapon"];
    _.each(types, function(type) {
        self.util.writeFile(path.join(BstConst.PATH_DATABASE, type, 'data', 'data.json'), self.util.formatJson(self.db[type]));
        self.util.writeFile(path.join(BstConst.PATH_DATABASE, type, 'data', 'data_invalid.json'), self.util.formatJson(self.dbInvalid[type]));
        self.grunt.log.writeln('[BstUpkParser] Database build of ' + type + ' done ...');
    });

    self.grunt.log.writeln('[BstUpkParser] Database build all done ...');
    self.util.printHr();
};

BstUpkParser.prototype.buildData = function(skeletonData) {
    var self = this;

    var unrecognizedSkeletonUpkIds = _.keys(self.util.readJsonFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_SKELETON_UNRECOGNIZED)));
    var unrecognizedNonSkUpkIds = _.keys(self.util.readJsonFile(path.join(BstConst.PATH_UPK_DATA_LIST, BstConst.LIST_FILE_UNRECOGNIZED)));
    var unrecognizedUpkIds = unrecognizedSkeletonUpkIds.concat(unrecognizedNonSkUpkIds); // 将两组未能识别的upk id列表合并

    var skeletonId = skeletonData['upkId'];
    var skeletonCode = skeletonData['code'];
    var skeletonType = self.upkSkeletonTypes[skeletonId];

    // 查找对应code的icon数据
    var iconData = null;
    var types = ["costume", "attach", "weapon"];
    _.each(types, function(typeName) {
        if (self.iconData[typeName].hasOwnProperty(skeletonCode)) {
            iconData = self.iconData[typeName][skeletonCode];
        }
    });
    if (iconData === null
        && skeletonCode.match(/^\d{3}$/) === null) { // 3位数字类型的code一般是默认头发等没有icon的模型
        // 没有找到icon数据集，记录日志
        /**
         * UPDATE: 这里不再打log，日志过多
         * self.utilBuildDataInvalidInfo(skeletonType, skeletonCode);
         * self.dbInvalid[skeletonType][skeletonCode]['notFound'].push('pic:[skeleton:' + skeletonId + ']');
         * self.grunt.log.error('[BstUpkParser] Icon pic has not been found, code: ' + skeletonCode + ', skeleton: ' + skeletonId);
         */
    }

    // 根据skeleton数据，获得texture数据
    var textureId = skeletonData['texture'];
    var textureData = null;
    if (self.upkDataTexture.hasOwnProperty(textureId)) {
        textureData = self.upkDataTexture[textureId];
    } else {
        self.utilBuildDataInvalidInfo(skeletonType, skeletonCode);
        self.dbInvalid[skeletonType][skeletonCode]['notFound'].push('texture:[skeleton:' + skeletonId + ',texture:' + textureId + ']');
        self.grunt.log.error('[BstUpkParser] Texture data not found, code: ' + skeletonCode +
            ', skeleton: ' + skeletonId + ', texture: ' + textureId);
        return; // 这个skeleton没必要处理下去了，因为缺失texture
    }

    // 检查texture数据
    if (_.keys(textureData['materials']).length == 0) {
        self.grunt.log.writeln('[BstUpkParser] No materials info collected for texture: ' + textureId + ', scanning all upk logs ...');
        /**
         * 没有为该texture找到对应的material数据，可能某些描述material信息的upk文件，在关键行[3]里没有以
         * 的格式进行描述，参考例子：
         * skeleton：00017488，texture：00017486，material：00017487
         * material关键行为：Loading Material3 Basic_FX from package 00017487.upk
         * 这里我们需要全局重新扫描upk文件，查找拥有两个关键特征的upk文件：
         * 1. 文件中拥有材质信息：
         *     Loading MaterialInstanceConstant col1 from package 00017487.upk
         * 2. 文件中拥有贴图信息：
         *     Loading Texture2D 60071_GonM_col1_N from package 00017486.upk
         *     Loading Texture2D 60071_GonM_col1_M from package 00017486.upk
         *     Loading Texture2D 60071_GonM_col1_D from package 00017486.upk
         *     Loading Texture2D 60071_GonM_col1_S from package 00017486.upk
         */
        _.each(unrecognizedUpkIds, function(scanUpkId) {
            var scanUpkPath = path.join(BstConst.PATH_UPK_LOG, scanUpkId + '.log');
            var scanUpkLog = self.util.readFileSplitWithLineBreak(scanUpkPath);

            var scanMaterialInfo = null;
            var foundTextureInfo = false;

            _.each(scanUpkLog, function(scanLine) {
                var scanMaterialMatch = scanLine.match(new RegExp("Loading\\sMaterialInstanceConstant\\s(.+)\\sfrom\\spackage\\s" + scanUpkId + ".upk"));
                if (scanMaterialInfo === null && scanMaterialMatch !== null) {
                    // 只需要查找第一个找到的material信息
                    scanMaterialInfo = self.util.formatCol(scanMaterialMatch[1]);
                }
                var scanTextureMatch = scanLine.match(new RegExp("Loading\\sTexture2D\\s.+\\sfrom\\spackage\\s" + textureId + ".upk"));
                if (scanTextureMatch !== null) {
                    foundTextureInfo = true;
                }
            });

            if (scanMaterialInfo !== null && foundTextureInfo) {
                // 两项条件全部满足，更新textureData['materials']数据
                textureData['materials'][scanMaterialInfo] = scanUpkId;
            }
        });
    }
    if (_.keys(textureData['materials']).length == 0) {
        // 仍旧没有找到贴图对应的材质upk信息
        self.utilBuildDataInvalidInfo(skeletonType, skeletonCode);
        self.dbInvalid[skeletonType][skeletonCode]['invalid'].push('texture:[skeleton:' + skeletonId + ',texture:' + textureId + ']');
        self.grunt.log.error('[BstUpkParser] Texture has no materials data, code: ' + skeletonCode +
            ', skeleton: ' + skeletonId + ', texture: ' + textureId);
        return; // 当前的texture没有对应的material
    }

    // 根据texture数据，获得相关的materials列表和数据
    var materials = textureData['materials']; // { colX : upkId, ... }

    // 组装数据
    _.each(materials, function(materialId, col) { // 轮询所有的materials数据
        // 检查material数据
        if (self.upkDataMaterialInvalid.hasOwnProperty(materialId)) {
            self.utilBuildDataInvalidInfo(skeletonType, skeletonCode);
            self.dbInvalid[skeletonType][skeletonCode]['invalid'].push('material:[skeleton:' + skeletonId + ',texture:' + textureId + ',material:' + materialId + ']');
            self.grunt.log.error('[BstUpkParser] Material has invalid data, code: ' + skeletonCode +
                ', skeleton: ' + skeletonId + ', texture: ' + textureId + ', material: ' + materialId);
            return; // 当前的material有错误数据
        }

        // 选取图片
        var pic = null;
        if (iconData !== null) {
            var icons = iconData['colIcons'];
            if (icons.hasOwnProperty(skeletonData['race'] + '_' + col)) {
                // 有精确的种族 + col icon
                pic = icons[skeletonData['race'] + '_' + col];
            } else if (icons.hasOwnProperty('All_' + col)) {
                // 有all种族 + col icon
                pic = icons['All_' + col];
            } else if (icons.hasOwnProperty(col) && icons[col].length > 0) {
                // 有对应的 col icon
                pic = icons[col][0];
            } else if (icons.hasOwnProperty(skeletonData['race'])) {
                // 有对应的种族icon
                pic = icons[skeletonData['race']];
            } else if (icons.hasOwnProperty('All')) {
                // 有all种族的icon
                pic = icons['All'];
            }
            if (pic === null && _.keys(icons).length > 0) {
                // icon图片未找到，但是icon图片配置列表里是有东西的，则随便给一个
                var firstIconKey = _.keys(icons).shift();
                if (_.isArray(icons[firstIconKey])) {
                    pic = icons[firstIconKey].shift();
                } else {
                    pic = icons[firstIconKey];
                }
            }
            if (pic === null) {
                // 没有找到icon，记录日志
                self.utilBuildDataInvalidInfo(skeletonType, skeletonCode);
                self.dbInvalid[skeletonType][skeletonCode]['notFound'].push('pic:[skeleton:' + skeletonId + ',texture:' + textureId + ',material:' + materialId + ']');
                self.grunt.log.error('[BstUpkParser] Icon pic has not been found, code: ' + skeletonCode +
                    ', skeleton: ' + skeletonId + ', texture: ' + textureId + ', material: ' + materialId);
            }
        }

        // 写入数据
        self.db[skeletonType][skeletonData['core'] + '_' + col] = {
            "skeleton": skeletonId,
            "texture": textureId,
            "material": materialId,
            "col1Material": skeletonData['col1Material'],
            "col": col,
            "core": skeletonData['core'],
            "code": skeletonCode,
            "race": skeletonData['race'],
            "pic": pic
        };
    });
};

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

BstUpkParser.prototype.utilSearchMeshXmlViaSkeletonId = function(skeletonId) {
    var filtered = _.filter(this.meshXml, function(element) {
        var resourceMatch = element['$']['resource-name'].match(/(\d+)\..*/);
        return (
            BstConst.RACE_VALID.indexOf(element['$']['race']) !== -1 // race 种族字符串必须是4大种族中的一个
            && resourceMatch !== null // resource-name 这一项"."之前必须是一串数字，匹配skeleton upk id
            && resourceMatch[1] == skeletonId // skeleton upk id 数值一致
        );
    });
    filtered = filtered.shift(); // 只取第一个，虽然理论上也只应该有一个，因为是根据skeleton upk id来筛选的

    /**
     * _.filter的返回结果永远是一个object，即便没找到，返回的也是"[]"格式的object，shift()返回值可能为undefined
     */
    if (typeof filtered === 'undefined') {
        filtered = null;
    }

    return filtered;
};

BstUpkParser.prototype.utilRecognizeSkeletonType = function(skeletonId, upkLog) {
    var self = this;

    if (upkLog === null || upkLog === '' || typeof upkLog === 'undefined') {
        upkLog = self.util.readFileSplitWithLineBreak(path.join(BstConst.PATH_UPK_LOG, skeletonId + '.log'));
    }

    var coreLineOfContent = upkLog[BstConst.UPK_ENTRANCE_LINE_NO];

    if (coreLineOfContent.match(/\d+_(KunN|JinF|JinM|GonF|GonM|LynF|LynM)/i) !== null) {
        // costume & attachment
        var type = BstConst.PART_TYPE_ATTACH; // 默认 attach

        // 01. 检查icon，在icon数据集的costume分类下存在code的，是衣服
        var codeMatch = coreLineOfContent.match(/(\d+)_(KunN|JinF|JinM|GonF|GonM|LynF|LynM)/i);
        var code = codeMatch[1];
        if (self.iconData['costume'].hasOwnProperty(code)) {
            type = BstConst.PART_TYPE_COSTUME;
        }

        // 02. 检查mesh.xml里的数据，数据存在，且类型是"body-mesh"的，是衣服
        if (type === BstConst.PART_TYPE_ATTACH) {
            var meshElement = self.utilSearchMeshXmlViaSkeletonId(skeletonId);
            if (meshElement !== null
                && meshElement.hasOwnProperty('type-mesh')
                && meshElement['$']['type-mesh'] == 'body-mesh') {
                type = BstConst.PART_TYPE_COSTUME;
            }
        }

        // 03. 首先检查upk log里有没有含body的Material3信息，有的话，是衣服
        if (type === BstConst.PART_TYPE_ATTACH) {
            _.each(upkLog, function(line) {
                var match = line.match(/Loading\sMaterial3\s(.+)\sfrom\spackage\s\d+.upk/);
                if (match !== null && match[1].toLowerCase().match(/.*body.*/i) !== null) {
                    type = BstConst.PART_TYPE_COSTUME;
                }
            });
        }

        return type;

    } else if (coreLineOfContent.match(/\d+_Autoscale/i) !== null) {
        // weapon with autoscale
        return BstConst.PART_TYPE_WEAPON;
    } else if (coreLineOfContent.match(/Loading\sSkeletalMesh3\s(\d+)\sfrom\spackage\s\d+.upk/) !== null) {
        // weapon with numeric id
        return BstConst.PART_TYPE_WEAPON;
    } else if (coreLineOfContent.match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM)_\d+/i) !== null) {
        // hair
        return BstConst.PART_TYPE_ATTACH;
    } else {
        // unrecognized
        return BstConst.PART_TYPE_UNRECOGNIZED;
    }
};

module.exports = BstUpkParser;