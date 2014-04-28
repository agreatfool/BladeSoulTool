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
     * 格式:
     * {
     *     "body": {
     *         "绅士": "http://cha.17173.com/bns/fashion/2090928.html",
     *         ...
     *     }
     * }
     */
    this.collectdLinks = {
        "body": {},
        "face": {},
        "hair": {}
    };
    /**
     * 格式:
     * {
     *     "body": {
     *         "60094_GonF_col1": {
     *             "name": "红宝石",
     *             "code": "60094",
     *             "col": "col1",
     *             "class": "costume",
     *             "require": "龙女专用",
     *             "pic": "Costume_60094_GonF_col1.png",
     *             "piclink": "http://i1.17173cdn.com/z6po4a/YWxqaGBf/images/data/fashion/big/Costume_60094_GonF_col1.png",
     *             "link": "http://cha.17173.com/bns/fashion/90046.html"
     *         },
     *         ...
     *     }
     * }
     * require的可能选项：全种族通用、男性专用、女性专用、人男专用、人女专用、龙男专用、龙女专用、灵男专用、灵女专用、天族专用
     */
    this.collectedData = {
        "body": {},
        "face": {},
        "hair": {}
    };
};

BstCrawler.prototype.start = function() {
    this.grunt.log.writeln(JSON.stringify(this.conf));
};

module.exports = BstCrawler;