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