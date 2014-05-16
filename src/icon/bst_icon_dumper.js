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

var BstIconDumper = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);

    this.gruntWorkingPath = process.cwd();
};

BstIconDumper.ICON_UPK_ID = '00008758';

BstIconDumper.PATH_ICON_BASE = 'database/icon';
BstIconDumper.PATH_ICON_TGA = path.join(BstIconDumper.PATH_UPK_BASE, 'tga');
BstIconDumper.PATH_ICON_PNG = path.join(BstIconDumper.PATH_UPK_BASE, 'png');


BstIconDumper.prototype.start = function() {
    var self = this;

    self.util.printHr();
    self.grunt.log.writeln('[BstIconDumper] Start to parse upk files ...');
    self.util.printHr();

    cp.exec('umodel.exe -export -path=' + self.util.getBnsPath() + ' -game=bns -out=output ' + BstIconDumper.ICON_UPK_ID,
        {"cwd": './resources/umodel'},
        function(error, stdout) {
            if (error) {
                self.grunt.fail.fatal('');
            }
        }
    );
};

BstIconDumper.prototype.process = function(filename, logPath) {
};

module.exports = BstIconDumper;