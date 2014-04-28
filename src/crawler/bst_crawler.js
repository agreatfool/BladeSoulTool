"use strict";

var cheerio = require('cheerio');
var request = require('request');
/**
 * @type {BstUtil|exports}
 */
var Util = require('../util/bst_util.js');

var BstCrawler = function(grunt) {
    // 准备工具
    /** @type {grunt} */
    this.grunt = grunt;
    this.util = new Util(grunt);

    // 读取配置
    var confPath = './config/crawler/crawler.json'; // 使用grunt读取的文件，位置必须相对于Gruntfile.js
    this.util.checkFileExists(confPath);
    this.conf = this.grunt.file.readJSON(confPath);

    // 设置状态
    this.part = null; // 当前在爬取的数据是哪个部分的：body、face、hair
    this.maxListEdge = -1; // 最后一页是第几页，暂时未知，初始为-1
    this.maxWorkingListPageNum = -1; // 已开始爬取的最大列表页id，初始是-1
    /**
     * 进程工作状态：
     * working：正在工作
     * pause：暂停，只会出现在列表爬取工作结束后，细节页面爬取开始前
     * done：所有工作结束
     */
    this.workingList = []; // 正在爬取的列表页
    this.workingDetail = []; // 正在爬取的细节页

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

BstCrawler.WORKING_TYPE_LIST   = 'list';
BstCrawler.WORKING_TYPE_DETAIL = 'detail';

BstCrawler.DB_ROOT_OF_17173 = 'http://cha.17173.com';

BstCrawler.prototype.start = function(part) {
    this.util.printHr();
    if ([BstCrawler.PART_BODY, BstCrawler.PART_FACE, BstCrawler.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstCrawler] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstCrawler] Start to crawl list pages of part: ' + part);
    this.util.printHr();

    this.part = part;
    var indexUrl = this.conf[part];

    this.fetchPage(indexUrl, 1, BstCrawler.WORKING_TYPE_LIST);

    var self = this;

    /**
     * 状态控制总机：
     * 第一次设置时长控制器，是在开始读取列表页的第一页之后，持续监视 this.workingList 和 this.maxListEdge
     * 当 this.workingList 为空的时候，表示所有的列表页爬取已经完成了
     * 当 this.maxListEdge 不为 -1 的时候，说明第一页的列表页已经爬取解析完成了，获得了部分页面id
     * 当上述两者同时满足，则表示列表爬取结束了，可以开始后续的细节爬取
     */
    var listTimer = setInterval(function() {
        // 向队列内添加列表页获取的工作条目
        for (var num = (self.maxWorkingListPageNum + 1); num <= self.maxListEdge; num++) {
            self.fetchPage(indexUrl, num, BstCrawler.WORKING_TYPE_LIST);
            if (self.maxWorkingListPageNum < num) {
                self.maxWorkingListPageNum = num;
            }
        }

        // 检查完成度
        if (self.workingList.length == 0 // 所有列表工作完成
            && self.maxListEdge !== -1) { // 最初的列表页解析完成了，已经知道一部分的页面id
            clearInterval(listTimer);
            self.util.writeFile(
                './database/crawler/' + self.part + '/list.json', // 使用grunt的write API，所以需要相对于Gruntfile.js的路径
                JSON.stringify(self.collectdLinks[self.part], null, 4)
            );
            self.util.printHr();
            self.grunt.log.writeln('[BstCrawler] All list pages done, start to crawl detail pages of part: ' + part);
            funcDetailWorkStart();
        }
    }, 500);

    var funcDetailWorkStart = function() {
        self.util.printHr();
        self.grunt.log.writeln('funcDetailWorkStart');
    };
};

BstCrawler.prototype.fetchPage = function(url, pageNumber, workingType) {
    var self = this;

    self.grunt.log.writeln('[BstCrawler] Start to fetch list page of number: ' + pageNumber);

    self.workingList.push(pageNumber);

    request(url + '&page=' + pageNumber, function (error, response, body) {
        if (error) {
            self.grunt.fail.warn('[BstCrawler] Error in fetching url: ' + url); return;
        }
        if (response.statusCode != 200) {
            self.grunt.fail.warn('[BstCrawler] Wrong code "' + response.statusCode + '" while fetching url: ' + url); return;
        }
        switch (workingType) {
            case BstCrawler.WORKING_TYPE_LIST:
                self.parseListPage(body, pageNumber); // 列表页面需要页面id进行标识
                break;
            case BstCrawler.WORKING_TYPE_DETAIL:
                self.parseDetailPage(body, url); // 细节页面不需要页面id来标识，每张页面的地址都不同
                break;
            default:
                self.grunt.fail.warn('[BstCrawler] Invalid fetch working type, type: ' + workingType);
                break;
        }
    })
};

BstCrawler.prototype.parseListPage = function(body, pageNumber) {
    var self = this;

    self.grunt.log.writeln('[BstCrawler] Start to parse list page of number: ' + pageNumber);

    var $ = cheerio.load(body);

    var content = $('#content');

    // 定义解析结束事件
    var funcFinishListPageCrawl = function() {
        var workingIndex = self.workingList.indexOf(pageNumber);
        if (workingIndex !== -1) {
            self.workingList.remove(workingIndex);
        } else {
            self.grunt.fail.warn('[BstCrawler] Finished list page info cannot be found in this.workingList, pageNumber: ' + pageNumber);
        }
        self.grunt.log.writeln('[BstCrawler] Crawl work of page "' + pageNumber +
            '" done. Current max page number of list pages is: ' + self.maxListEdge);
    };

    // 解析页面底部分页列表，获取最大页数
    var pagerList = content.find('.main .con-box .page .page-change .yiiPager .page');
    if (pagerList.length == 0) {
        self.grunt.fail.warn('[BstCrawler] List page has no foot pager, pageNumber: ' + pageNumber);
    } else {
        pagerList.each(function(index, element) {
            var pageNumber = parseInt($(element).find('a').text().trim());
            if (self.maxListEdge === -1 || self.maxListEdge < pageNumber) {
                self.maxListEdge = pageNumber;
            }
        });
    }

    // 解析页面上的物品列表，获得名字和具体介绍链接
    var tbodyOfListWithContents = content.find('.main .con-box .tb-list tbody')[1]; // 0号tbody里都是表头
    var trOfTbodyList = $(tbodyOfListWithContents).find('tr');
    if (typeof trOfTbodyList !== 'object' || trOfTbodyList.length == 0) {
        self.grunt.fail.warn('[BstCrawler] List page has no item list, pageNumber: ' + pageNumber);
        funcFinishListPageCrawl();
    } else {
        trOfTbodyList.each(function(index, element) {
            var tdWithNameAndLink = $(element).find('td')[1]; // 0号td里的是图片 + 链接，1号才是名字 + 链接
            var link = BstCrawler.DB_ROOT_OF_17173 + $(tdWithNameAndLink).find('a').attr('href');
            var name = $(tdWithNameAndLink).find('span').text().trim();
            self.collectdLinks[self.part][name] = link;
//            self.grunt.log.writeln('[BstCrawler] List info got: ' + name + ': ' + link);

            if (index == (trOfTbodyList.length - 1)) { // 当前列表页面的最后一项物品
                funcFinishListPageCrawl();
            }
        });
    }
};

BstCrawler.prototype.parseDetailPage = function(body, url) {

};

module.exports = BstCrawler;