"use strict";

/**
 * @type {BstUtil|exports}
 */
var Util = require('../util/bst_util.js');

var BstCrawler = function(grunt) {
    /** @type {grunt} */
    this.grunt = grunt;
    this.util = new Util(grunt);

    var confPath = './config/crawler/crawler.json'; // 使用grunt读取的文件，位置必须相对于Gruntfile.js
    this.util.checkFileExists(confPath);
    this.conf = this.grunt.file.readJSON(confPath);

    /**
     *
     * @type {{body: {}, face: {}, hair: {}}}
     */
    this.collectd = {
        "body": {},
        "face": {},
        "hair": {}
    };
};

BstCrawler.prototype.start = function() {
    this.grunt.log.writeln(JSON.stringify(this.conf));
};

module.exports = BstCrawler;