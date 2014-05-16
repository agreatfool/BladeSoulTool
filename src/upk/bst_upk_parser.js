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
     *
     */
    this.upks = {}; // 暂存的upk数据
};

BstUpkParser.ENTRANCE_LINE_NO = 2; // 一般来说，log的第三行里的内容是关键信息
BstUpkParser.UPK_TYPE_SKELETON = 'SkeletalMesh3';
BstUpkParser.UPK_TYPE_TEXTURE  = 'Texture2D';
BstUpkParser.UPK_TYPE_MATERIAL = 'MaterialInstanceConstant';

BstUpkParser.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstUpkParser] Start to parse upk files ...');
    self.util.printHr();

    self.grunt.file.recurse('database/costume/upk_log', function(abspath, rootdir, subdir, filename) {
        if (filename !== 'upk_dir') {
            self.process(filename, abspath);
        }
    });
    self.util.writeFile('database/costume/upk_data/upk_raw_list.json', self.util.formatJson(self.upks));
};

BstUpkParser.prototype.process = function(filename, logPath) {
    this.grunt.log.writeln('[BstUpkParser] Start to parse upk file: ' + logPath);
    var content = this.util.readFile(logPath).toString().split("\r\n");
    this.upks[filename] = content[2];

    if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_SKELETON)) !== null) {
        this.processSkeleton(filename, logPath, content);
    } else if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_TEXTURE)) !== null) {
        this.processTexture(filename, logPath, content);
    } else if (content[2].match(new RegExp(BstUpkParser.UPK_TYPE_MATERIAL)) !== null) {
        this.processMaterial(filename, logPath, content);
    }
};

BstUpkParser.prototype.processSkeleton = function(filename, logPath, content) {
    var self = this;
};

BstUpkParser.prototype.processTexture = function(filename, logPath, content) {

};

BstUpkParser.prototype.processMaterial = function(filename, logPath, content) {

};

BstUpkParser.prototype.finishProcess = function(logPath) {
};

module.exports = BstUpkParser;