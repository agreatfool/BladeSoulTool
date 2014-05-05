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
};

BstScreenShooter.prototype.start = function() {

};