"use strict";

var path = require('path');

/**
 * @type {BstUtil|exports}
 */
var BstUtil = require('../util/bst_util.js');

var BstRestore = function(grunt) {
    this.grunt = grunt;
    this.util = new BstUtil(grunt);
};

BstRestore.prototype.start = function() {
    this.util.printHr();
    this.grunt.log.writeln('[BstRestore] Start to restore models');
    this.util.printHr();
};

module.exports = BstRestore;