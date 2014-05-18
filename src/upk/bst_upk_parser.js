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

};

BstUpkParser.prototype.process = function(filename, logPath) {

};

BstUpkParser.prototype.processSkeleton = function(filename, logPath, content) {

};

BstUpkParser.prototype.processTexture = function(filename, logPath, content) {

};

BstUpkParser.prototype.processMaterial = function(filename, logPath, content) {

};

BstUpkParser.prototype.finishProcess = function(logPath) {
};

module.exports = BstUpkParser;