"use strict";

var cp = require('child_process');
var path = require('path');
var _ = require('underscore');

/**
 * @type {BstUtil|exports}
 */
var Util = require('../util/bst_util.js');

var BstScreenShooter = function(grunt) {
    this.grunt  = grunt;
    this.util   = new Util(grunt);

    this.part = null; // 当前抓的是哪个部分的图：body、face、hair

    this.data = {}; // 需要处理的数据：database/costume/[this.part]/data.json, etc...
    this.workingList = null; // 需要处理的数据的键数组：_.keys(this.data)
    this.statusTotalCount = 0; // 总共需要处理的模型个数
    this.statusFinishedCount = 0; // 处理完成的模型个数
};

BstScreenShooter.PART_BODY = 'body';
BstScreenShooter.PART_FACE = 'face';
BstScreenShooter.PART_HAIR = 'hair';

BstScreenShooter.prototype.start = function(part) {
    this.util.printHr();
    if ([BstScreenShooter.PART_BODY, BstScreenShooter.PART_FACE, BstScreenShooter.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstScreenShooter] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstScreenShooter] Start to take screenshot of part: ' + part);
    this.util.printHr();

    this.part = part;

    this.process();
};

BstScreenShooter.prototype.process = function() {
    var rawData = this.util.readJsonFile('./database/costume/' + this.part + '/data.json');
    switch (this.part) {
        case BstScreenShooter.PART_BODY:
            this.processBody(rawData);
            break;
        case BstScreenShooter.PART_FACE:
            this.processFace(rawData);
            break;
        case BstScreenShooter.PART_HAIR:
            this.processHair(rawData);
            break;
        default:
            break;
    }
};

BstScreenShooter.prototype.processBody = function(rawData) {
    var self = this;

    _.each(rawData, function(raceData) {
        self.data = _.extend(self.data, raceData);
    });
    self.workingList = _.keys(self.data);
    self.statusTotalCount = self.workingList.length;

    self.grunt.log.writeln('[BstScreenShooter] body data loaded, "' + self.statusTotalCount + '" lines of record read.');
    self.util.printHr();

    // TODO process control
};

BstScreenShooter.prototype.processFace = function(rawData) {

};

BstScreenShooter.prototype.processHair = function(rawData) {

};

BstScreenShooter.prototype.processSingle = function() {

};

module.exports = BstScreenShooter;