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

    /**
     * 01.过滤并整理icon文件夹：
     * 找出
     * attach_：(头饰、面饰、身体饰品)
     * costume_：(时装)
     * weapon_：(武器)
     * 开头的icon文件，组装成下述结构：
     * [
     *     {
     *         code: 010051,
     *         races: [JinM, JinF, ...], // 当前code能找到的所有race信息
     *         col: [col1, col2] // 当前code能找到的所有col信息
     *         colIcons: {
     *             GonM_col1: "Attach_010022_GonM_col1.png", // 有带种族信息的话，完整放入一份，然后再在colX里也放一份
     *             GonM_col2: "Attach_010022_GonM_col2.png",
     *             col1: ["Attach_010022_GonM_col1.png", ...],
     *             col2: ["Attach_010022_GonM_col2.png", ...],
     *             GonM: "Attach_010022_GonM.png" // 这张图片其实并不存在，这里仅举例
     *         } // 首先选择种族、col都符合的，其次选择符合col的、再次选择符合种族的
     *     },
     *     ...
     * ]
     *
     * icon里有相当多的图片，其实两张都一样的，但是背景不同，会多带一个_X的后缀，举例：
     * Costume_50004_JinF.png
     * Costume_50004_JinF_2.png
     * 这里需要忽略这些完全一样只有背景不一样的图片，只取用不带后缀的版本
     *
     * 02.过滤upk logs粗分类为：
     * list/list_skeleton_costume_with_attachmen.json
     * list/list_skeleton_unrecognized.json
     * list/list_unrecognized.json
     * list/list_material.json
     * list/list_texture.json
     *
     * 03.过list_skeleton.json
     * 组织成结构：
     * {
     *     00010868: {
     *         upkId: 00010868
     *         code: 65045,
     *         race: JinF,
     *         col1Material: 00010867,
     *         texture: 00010866,
     *         textureObjs: [65045_JinF_N, 65045_JinF_M, 65045_JinF_D, 65045_JinF_S],
     *     }
     * }
     *
     * 04.过list_texture.json
     * 组织成结构：
     * {
     *     00010866: {
     *         upkId: 00010866,
     *         objs: [
     *             65045_JinF_D, 65045_JinF_M, 65045_JinF_N, 65045_JinF_S,
     *             65045_JinF_col2_D, 65045_JinF_col2_M, 65045_JinF_col2_N, 65045_JinF_col2_S
     *         ],
     *         materials: [00010867, 00019801]
     *     }
     * }
     *
     * 05.过list_material.json
     * 组织成结构：
     * {
     *     00010867: {
     *         upkId: 00010867,
     *         col: col1,
     *         objs: [65045_JinF_N, 65045_JinF_M, 65045_JinF_D, 65045_JinF_S]
     *     },
     *     00010867: {
     *         upkId: 00019801,
     *         col: col2,
     *         objs: [65045_JinF_col2_N, 65045_JinF_col2_M, 65045_JinF_col2_D, 65045_JinF_col2_S]
     *     }
     * }
     *
     * 此外，几点怀疑：
     * skeleton里 SkeletalMesh3 JinM_029 表示的是发型
     * keletalMesh3 060041_Autoscale 表示的是武器，参考：http://dl.dropboxusercontent.com/u/18196592/plaync/bns/weapon.htm
     */
};

BstUpkParser.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkParser] Start to parse upk files ...');
    self.util.printHr();

    self.preProcess();

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
                    upkListSkeletonCostumeWithAttachment[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/\d+_Autoscale/i) !== null) {
                    // weapon with autoscale
                    upkListSkeletonWeapon[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/Loading\sSkeletalMesh3\s(\d+)\sfrom\spackage\s\d+.upk/) !== null) {
                    // weapon with numeric id
                    upkListSkeletonWeapon[upkId] = coreLineOfContent;
                } else if (coreLineOfContent.match(/(KunN|JinF|JinM|GonF|GonM|LynF|LynM)_\d+/i) !== null) {
                    // hair
                    upkListSkeletonHair[upkId] = coreLineOfContent;
                } else {
                    upkListSkeletonUnrecognized[upkId] = coreLineOfContent;
                }
            } else if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_TEXTURE)) !== null) {
                // texture
                upkListTexture[upkId] = coreLineOfContent;
            } else if (coreLineOfContent.match(new RegExp(BstConst.UPK_TYPE_MATERIAL)) !== null) {
                // material
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

};

module.exports = BstUpkParser;