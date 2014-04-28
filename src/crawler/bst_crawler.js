"use strict";

var cheerio = require('cheerio');
var request = require('request');
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

    this.currentWorkingEdge = 1; // 默认正在处理的页面边界是第一页，如果同时在处理2、3、4页的话，则边界是4，永远是最大值
    this.maxEdge = -1; // 最后一页是第几页，暂时未知，初始为-1
    /**
     * 进程工作状态：
     * working：正在工作
     * pause：暂停，只会出现在列表爬取工作结束后，细节页面爬取开始前
     * done：所有工作结束
     */
    this.status = 'working'; // 启动的时候就是working了

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
     *             "class": "body",
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

BstCrawler.PART_BODY = 'body';
BstCrawler.PART_FACE = 'face';
BstCrawler.PART_HAIR = 'hair';

BstCrawler.STATUS_WORKING = 'working';
BstCrawler.STATUS_PAUSE   = 'pause';
BstCrawler.STATUS_DONE    = 'done';

BstCrawler.prototype.start = function(part) {
    if ([BstCrawler.PART_BODY, BstCrawler.PART_FACE, BstCrawler.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstCrawler] Invalid start part specified: ' + part);
    }
    var indexUrl = this.conf[part];

    this.fetchPage(indexUrl, this.parseListPage);
};

BstCrawler.prototype.fetchPage = function(url, parser) {
    var self = this;

    request(url, function (error, response, body) {
        if (error) {
            self.grunt.fail.warn('[BstCrawler] Error in fetching url: ' + url); return;
        }
        if (response.statusCode != 200) {
            self.grunt.fail.warn('[BstCrawler] Wrong code "' + response.statusCode + '" in fetching url: ' + url); return;
        }
        if (typeof parser !== 'function') {
            self.grunt.fail.warn('[BstCrawler] Invalid fetch callback, type: ' + (typeof parser));
        }
        parser(body);
    })
};

BstCrawler.prototype.parseListPage = function(body) {
    var self = this;

    var $ = cheerio.load(body);

    var tbodyOfListWithContents = $('#content').find('.main .con-box .tb-list tbody')[1]; // 0号tbody里都是表头

    $(tbodyOfListWithContents).find('tr').each(function(index, element) {
        var tdWithNameAndLink = $(element).find('td')[1]; // 0号td里的是图片 + 链接，1号才是名字 + 链接
        var link = $(tdWithNameAndLink).find('a').attr('href');
        var name = $(tdWithNameAndLink).find('span').text().trim();
        console.log(name + ' : ' + link);
    });

    $('#content').find('.main .con-box .page .page-change .yiiPager .page').each(function(index, element) {
        var pageNumber = $(element).find('a').text().trim();
        if (self.maxEdge === -1 || self.maxEdge < pageNumber) {
            self.maxEdge = pageNumber;
        }
    });
};

BstCrawler.prototype.parseDetailPage = function() {

};

module.exports = BstCrawler;