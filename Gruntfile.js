"use strict";

var fs = require('fs');
var path = require('path');
var Util = require('./src/util/bst_util.js');

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
//        crawler.part = 'body';
//        crawler.fetchPage("http://cha.17173.com/bns/fashion/2090682.html", 1, 'detail');

    };

    var Task_Crawler = function() { // --part=body
        var Crawler = require('./src/crawler/bst_crawler.js');

        this.async();

        var part = grunt.option('part');
        if (typeof part === 'undefined' || part == null || part == '') {
            grunt.log.error('[Grunt Task_Crawler] Command line option "--part" not given, use default value: "body".');
            part = Crawler.PART_BODY;
        }

        var crawler = new Crawler(grunt);
        crawler.start(part);
    };

    //-------------------------------------------------------------------------------------------
    // Tasks
    //-------------------------------------------------------------------------------------------
    grunt.registerTask('default', Task_Default);
    grunt.registerTask('crawler', Task_Crawler);

};