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

    this.data = {}; // 模型数据：database/costume/[this.part]/data.json, etc...
    this.modelId = null; // 当前工作需要替换的目标模型id
};

BstReplace.prototype.start = function(part, modelId) {
    this.util.printHr();
    if ([BstConst.PART_BODY, BstConst.PART_FACE, BstConst.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstReplace] Invalid start part specified: ' + part);
    }

    this.part = part;
    this.data = this.util.readJsonFile('./database/costume/' + this.part + '/data.json');
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

};

BstReplace.prototype.processFace = function() {

};

BstReplace.prototype.processHair = function() {

};

module.exports = BstReplace;