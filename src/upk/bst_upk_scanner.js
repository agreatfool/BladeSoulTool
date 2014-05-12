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

var BstUpkScanner = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.childProcess = this.conf['scanner']['childProcess'];
    this.cycleInterval = this.conf['scanner']['cycleInterval'];
};

BstUpkScanner.prototype.start = function() {
    this.util.printHr();
    this.grunt.log.writeln('[BstUpkScanner] Start to scan upk files');
    this.util.printHr();

    this.process();
};

BstUpkScanner.prototype.process = function() {

};

module.exports = BstUpkScanner;