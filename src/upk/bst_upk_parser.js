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

    // upk列表数据，格式皆为 { upkLogFileName : upkLogContentLineThree, ... }
    this.upkListSkeleton = {};
    this.upkListTexture = {};
    this.upkListMaterial = {};
    this.upkListUnrecognized = {}; // BstUpkParser.UPK_TYPE_* 可识别的upk类型之外的upk
};

BstUpkParser.PATH_UPK_BASE = 'database/upk';
BstUpkParser.PATH_UPK_LOG = path.join(BstUpkParser.PATH_UPK_BASE, 'log');
BstUpkParser.PATH_UPK_DATA = path.join(BstUpkParser.PATH_UPK_BASE, 'data');

BstUpkParser.ENTRANCE_LINE_NO = 2; // 一般来说，log的第三行里的内容是关键信息

BstUpkParser.UPK_TYPE_SKELETON = 'SkeletalMesh3';
BstUpkParser.UPK_TYPE_TEXTURE  = 'Texture2D';
BstUpkParser.UPK_TYPE_MATERIAL = 'MaterialInstanceConstant';

BstUpkParser.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkParser] Start to parse upk files ...');
    self.util.printHr();

    self.grunt.file.recurse(BstUpkParser.PATH_UPK_LOG, function(abspath, rootdir, subdir, filename) {
        if (filename !== 'upk_dir') {
            self.process(filename, abspath);
        }
    });

    // 写入各分类的列表信息
    self.util.writeFile(path.join(BstUpkParser.PATH_UPK_DATA, 'list_skeleton.json'), self.util.formatJson(self.upkListSkeleton));
    self.util.writeFile(path.join(BstUpkParser.PATH_UPK_DATA, 'list_texture.json'), self.util.formatJson(self.upkListTexture));
    self.util.writeFile(path.join(BstUpkParser.PATH_UPK_DATA, 'list_material.json'), self.util.formatJson(self.upkListMaterial));
    self.util.writeFile(path.join(BstUpkParser.PATH_UPK_DATA, 'list_unrecognized.json'), self.util.formatJson(self.upkListUnrecognized));
};

BstUpkParser.prototype.process = function(filename, logPath) {
    this.grunt.log.writeln('[BstUpkParser] Start to parse upk file: ' + logPath);
    var content = this.util.readFile(logPath).toString().split("\r\n");

    if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_SKELETON)) !== null) {
        this.upkListSkeleton[filename] = content[2];
        this.processSkeleton(filename, logPath, content);
    } else if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_TEXTURE)) !== null) {
        this.upkListTexture[filename] = content[2];
        this.processTexture(filename, logPath, content);
    } else if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_MATERIAL)) !== null) {
        this.upkListMaterial[filename] = content[2];
        this.processMaterial(filename, logPath, content);
    } else {
        this.upkListUnrecognized[filename] = content[2];
    }
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