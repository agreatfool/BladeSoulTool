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
    // 列表页状态
    this.statusMaxListEdge = -1; // 列表页面的最后一页是第几页，初始时未知，赋值为-1
    this.statusMaxWorkingListPageNum = 1; // 已开始爬取的所有列表页中页面number的最大值，初始是1，因为总是从第一页开始爬的
    this.statusTotalItemsOnListPage = 0; // 记录17173页面上显示出来的物品有多少个
    this.statusDuplicatedListItem = 0; // 记录从17173上爬取的物品有多少是重名重复的
    this.workingList = []; // 正在爬取的列表页：[listPageNumber, ...]
    // 细节页状态
    this.statusTotalDetailCount = 0; // 总共需要爬取的细节页数量
    this.statusFinishedDetailCount = 0; // 爬取完成的细节页面数量
    this.workingDetail = []; // 正在爬取的细节页：[detailUrl, ...]

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
     * 因为许多衣服在不通种族的情况下短码一致且名称也一致，可能会被忽略一部分，所以这里的require只能参考，不能作为强制措施使用
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
     * 第一次设置时长控制器，是在开始读取列表页的第一页之后，持续监视 this.workingList 和 this.statusMaxListEdge
     * 当 this.workingList 为空的时候，表示所有的列表页爬取已经完成了
     * 当 this.statusMaxListEdge 不为 -1 的时候，说明第一页的列表页已经爬取解析完成了，获得了部分页面id
     * 当上述两者同时满足，则表示列表爬取结束了，可以开始后续的细节爬取
     */
    var listTimer = setInterval(function() {
        // 向队列内添加列表页获取的工作条目
        for (var num = (self.statusMaxWorkingListPageNum + 1); num <= self.statusMaxListEdge; num++) {
            self.fetchPage(indexUrl, num, BstCrawler.WORKING_TYPE_LIST);
            if (self.statusMaxWorkingListPageNum < num) {
                self.statusMaxWorkingListPageNum = num;
            }
        }

        // 检查完成度
        if (self.workingList.length == 0 // 所有列表工作完成
            && self.statusMaxListEdge !== -1) { // 最初的列表页解析完成了，已经知道一部分的页面id
            clearInterval(listTimer);
            self.util.writeFile(
                './database/crawler/' + self.part + '/list.json', // 使用grunt的write API，所以需要相对于Gruntfile.js的路径
                JSON.stringify(self.collectdLinks[self.part], null, 4)
            );
            self.util.printHr();
            self.grunt.log.writeln('[BstCrawler] All list pages done, status:');
            self.grunt.log.writeln('[BstCrawler] Pages crawled: ' + self.statusMaxListEdge);
            self.grunt.log.writeln('[BstCrawler] Total items on page: ' + self.statusTotalItemsOnListPage);
            self.grunt.log.writeln('[BstCrawler] Duplicated items: ' + self.statusDuplicatedListItem);
            self.grunt.log.writeln('[BstCrawler] Links collected: ' + Object.keys(self.collectdLinks[self.part]).length);
            funcDetailWorkStart();
        }
    }, 500);

    var funcDetailWorkStart = function() {
        self.util.printHr();
        self.grunt.log.writeln('[BstCrawler] Start to crawl detail pages of part: ' + part);
        self.util.printHr();

        self.workingDetail = Object.values(self.collectdLinks[self.part]); // {"name": "url", ...} => ["url", ...]
        var detailStartTimer = setInterval(function() {
            for (var i = 0; i < 10; i++) { // 每个时间间隔内，发送10个请求
                if (self.workingDetail.length == 0) {
                    clearInterval(detailStartTimer); // 发完了
                    break;
                }
                self.fetchPage(self.workingDetail.shift(), 1, BstCrawler.WORKING_TYPE_DETAIL);
            }
        }, 50);

        var detailProgressTimer = setInterval(function() {
            if (self.statusFinishedDetailCount == self.statusTotalDetailCount) {
                clearInterval(detailProgressTimer);
                self.util.writeFile(
                    './database/crawler/' + self.part + '/data.json', // 使用grunt的write API，所以需要相对于Gruntfile.js的路径
                    JSON.stringify(self.collectedData[self.part], null, 4)
                );
                self.util.printHr();
                self.grunt.log.writeln('[BstCrawler] All detail pages done, status:');
                self.grunt.log.writeln('[BstCrawler] Pages crawled: ' + self.statusTotalDetailCount);
            }
        }, 500);
    };
};

BstCrawler.prototype.fetchPage = function(url, pageNumber, workingType) {
    var self = this;

    if ([BstCrawler.WORKING_TYPE_LIST, BstCrawler.WORKING_TYPE_DETAIL].indexOf(workingType) === -1) {
        self.grunt.fail.warn('[BstCrawler] Invalid fetch working type, type: ' + workingType);
    }
    self.grunt.log.writeln('[BstCrawler] Start to fetch list page of number: ' + pageNumber);

    // 向工作队列中添加标识位，只有列表页面需要，细节页面在总控中已经添加过了
    if (workingType == BstCrawler.WORKING_TYPE_LIST) {
        self.workingList.push(pageNumber);
        url += '&page=' + pageNumber; // 列表页面要加上页号
    }

    // 拉取页面数据
    request(url, function (error, response, body) {
        // 记录错误日志
        if (error) {
            self.grunt.fail.warn('[BstCrawler] Error in fetching url: ' + url);
        }
        if (response.statusCode != 200) {
            self.grunt.fail.warn('[BstCrawler] Wrong code "' + response.statusCode + '" while fetching url: ' + url);
        }

        // 进行错误处理
        if (error || response.statusCode != 200) { // 即便出错了，也需要将运行中队列里的状态去掉，否则程序不会停下来
            if (workingType == BstCrawler.WORKING_TYPE_LIST) {
                self.finishListPageCrawl(pageNumber);
            } else if (workingType == BstCrawler.WORKING_TYPE_DETAIL) {
                self.finishDetailPageCrawl(url);
            }
            return;
        }

        // 解析获得到的页面信息
        if (workingType == BstCrawler.WORKING_TYPE_LIST) {
            self.parseListPage(body, pageNumber); // 列表页面需要页面id进行标识
        } else if (workingType == BstCrawler.WORKING_TYPE_DETAIL) {
            self.parseDetailPage(body, url); // 细节页面不需要页面id来标识，每张页面的地址都不同
        }
    })
};

BstCrawler.prototype.parseListPage = function(body, pageNumber) {
    var self = this;

    self.grunt.log.writeln('[BstCrawler] Start to parse list page of number: ' + pageNumber);

    var $ = cheerio.load(body);

    var content = $('#content');

    // 解析页面底部分页列表，获取最大页数
    var pagerList = content.find('.main .con-box .page .page-change .yiiPager .page');
    if (pagerList.length == 0) {
        self.grunt.fail.warn('[BstCrawler] List page has no foot pager, pageNumber: ' + pageNumber);
    } else {
        pagerList.each(function(index, element) {
            var pageNumber = parseInt($(element).find('a').text().trim());
            if (self.statusMaxListEdge === -1 || self.statusMaxListEdge < pageNumber) {
                self.statusMaxListEdge = pageNumber;
            }
        });
    }

    // 解析页面上的物品列表，获得名字和具体介绍链接
    var tbodyOfListWithContents = content.find('.main .con-box .tb-list tbody')[1]; // 0号tbody里都是表头
    var trOfTbodyList = $(tbodyOfListWithContents).find('tr');
    if (typeof trOfTbodyList !== 'object' || trOfTbodyList.length == 0) {
        self.grunt.fail.warn('[BstCrawler] List page has no item list, pageNumber: ' + pageNumber);
        self.finishListPageCrawl(pageNumber);
    } else {
        self.statusTotalItemsOnListPage += trOfTbodyList.length;
        trOfTbodyList.each(function(index, element) {
            var tdWithNameAndLink = $(element).find('td')[1]; // 0号td里的是图片 + 链接，1号才是名字 + 链接
            var link = BstCrawler.DB_ROOT_OF_17173 + $(tdWithNameAndLink).find('a').attr('href');
            var name = $(tdWithNameAndLink).find('span').text().trim();
            if (self.collectdLinks[self.part].hasOwnProperty(name)) {
                self.statusDuplicatedListItem += 1;
                // self.grunt.log.writeln('[BstCrawler] Duplicate item on page: ' + name); // Too many info
            }
            self.collectdLinks[self.part][name] = link;
            // self.grunt.log.writeln('[BstCrawler] List info got: ' + name + ': ' + link); // Too many info

            if (index == (trOfTbodyList.length - 1)) { // 当前列表页面的最后一项物品
                self.finishListPageCrawl(pageNumber);
            }
        });
    }
};

BstCrawler.prototype.finishListPageCrawl = function(pageNumber) {
    var workingIndex = this.workingList.indexOf(pageNumber);
    if (workingIndex !== -1) {
        this.workingList.remove(workingIndex);
    } else {
        this.grunt.fail.warn('[BstCrawler] Finished list page info cannot be found in this.workingList, pageNumber: ' + pageNumber);
    }
    this.grunt.log.writeln('[BstCrawler] Crawl work of page "' + pageNumber +
        '" done. Current max page number of list pages is: ' + this.statusMaxListEdge);
};

BstCrawler.prototype.parseDetailPage = function(body, url) {
    // TODO
    this.finishDetailPageCrawl(url);
};

BstCrawler.prototype.finishDetailPageCrawl = function(url) {
    this.statusFinishedDetailCount++;
    var names = Object.keys(this.collectdLinks[this.part]);
    var urls = Object.values(this.collectdLinks[this.part]);
    var index = urls.indexOf(url);
    var name = names[index];
    this.grunt.log.writeln('[BstCrawler] Crawl work of detail page "' + name +
        '" done, progress: ' + this.statusFinishedDetailCount + ' / ' + this.statusTotalDetailCount);
};

module.exports = BstCrawler;