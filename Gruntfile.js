"use strict";

var fs = require('fs');
var path = require('path');
var Util = require('./src/util/bst_util.js');
var Crawler = require('./src/crawler/bst_crawler.js');

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Object.prototype.findByVal = function(val) {
    var result = null;
    for (var key in this) {
        if (!this.hasOwnProperty(key)) {
            continue;
        }
        if (val == this[key]) {
            result = {};
            result[key] = val;
            break;
        }
    }
    return result;
};

module.exports = function(grunt) {

    var Task_Default = function() {
        this.async();

        var crawler = new Crawler(grunt);
        crawler.start(Crawler.PART_BODY);

    };

    //-------------------------------------------------------------------------------------------
    // Tasks
    //-------------------------------------------------------------------------------------------
    grunt.registerTask('default', Task_Default);

};