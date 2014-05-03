"use strict";

var cp = require('child_process');
var path = require('path');
var xml2js = require('xml2js');
var _ = require('underscore');
/**
 * @type {BstUtil|exports}
 */
var Util = require('../util/bst_util.js');

var BstMeshParser = function(grunt) {
    this.grunt  = grunt;
    this.util   = new Util(grunt);
    this.parser = new xml2js.Parser();

    this.conf = this.util.readJsonFile('./config/setting.json');

    this.part = null; // 当前在解析的数据是哪个部分的：body、face、hair
    this.xml  = null; // 读取出来的mesh xml的record列表：<table>[xml => <record></record>]</table>
    this.body = null; // 过滤出所有 type-mesh 是 body-mesh 的数据
    this.face = null; // 过滤出所有 type-mesh 是 accessory-mesh 的数据
    this.hair = null; // 过滤出所有 type-mesh 是 hair-mesh 的数据

    this.crawledData = null; // 从17173站点上爬取到的数据，根据当前的part不同，可能从不同的文件读入
};

BstMeshParser.PART_BODY = 'body-mesh';
BstMeshParser.PART_FACE = 'accessory-mesh'; // FIXME 是这么分类的么？ accessory-mesh 应该是 attach 配件的意思
BstMeshParser.PART_HAIR = 'hair-mesh';

BstMeshParser.RACE_GON   = '곤';
BstMeshParser.RACE_KUN   = '건';
BstMeshParser.RACE_JIN   = '진';
BstMeshParser.RACE_LYN   = '린';
BstMeshParser.RACE_VALID = ['곤', '건', '진', '린'];
BstMeshParser.RACE_NONE  = 'race-none';

BstMeshParser.GENDER_M = '남';
BstMeshParser.GENDER_F = '여';

BstMeshParser.MESH_NAME = 'charactertoolappearance_mesh.xml';

BstMeshParser.prototype.start = function(part) {
    this.util.printHr();
    if ([BstMeshParser.PART_BODY, BstMeshParser.PART_FACE, BstMeshParser.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstMeshParser] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstMeshParser] Start to parse mesh xml of part: ' + part);
    this.util.printHr();

    this.part = part;
    this.dedat();
};

/**
 * 流程：
 * 1. 解包xml.dat文件
 * 2. 找出mesh.xml
 * 3. 解析，轮询所有项
 * 4. 如果是多色的，xml里有描述
 * 5. 如果是单色的，则需要umodel，分解，再查看单色的色指定文件
 *
 * 截图解决思路：
 * 1. 使用umodel.exe -view功能，启动展示窗，sleep 1秒，将UE Viewer窗口缩小，移动到屏幕0,0点，使用第三方软件截屏
 * http://www.nirsoft.net/utils/nircmd.html
 * http://stackoverflow.com/questions/10392620/how-can-a-batch-file-run-a-program-and-set-the-position-and-size-of-the-window
 * 2. 使用剑灵模型识别器，来批量导出图片，时候取用
 */

BstMeshParser.prototype.dedat = function() {
    var self = this;

    var meshXmlPath = './resources/dedat/output/engine/' + BstMeshParser.MESH_NAME;

    // 处理mesh xml的函数，需要在确定其存在（解包完成后），才会被调用
    var funcReadMeshXml = function() {
        self.util.readFile(meshXmlPath, function(data) {
            self.parser.parseString(data, function(err, result) {
                if (err) {
                    self.grunt.fail.fatal('[BstMeshParser] Error in parsing mesh.xml: ' + err.stack);
                }
                self.xml = result['table']['record'];
                self.grunt.log.writeln('[BstMeshParser] mesh.xml parsed, "' + self.xml.length + '" lines of records read.');
                self.process();
            });
        });
    };

    // 检查是否mesh xml已存在
    if (!this.grunt.file.exists(meshXmlPath)) { // 没有已经被解包的dat文件内容，需要现场解包
        var xmlDatPath = path.join(this.conf['path']['game'], this.conf['path']['data'], 'xml.dat');
        this.grunt.log.writeln('[BstMeshParser] Start to dedat xml.dat: ' + xmlDatPath);
        var worker = cp.spawn('dated_from208.exe', [xmlDatPath, '--', 'output', '--', 'd'], {"cwd": './resources/dedat/'});

        worker.stdout.on('data', function (data) {
            self.grunt.log.writeln('[BstMeshParser] Dedat process: stdout: ' + data);
        });
        worker.stderr.on('data', function (data) {
            if (data) {
                self.grunt.log.writeln('[BstMeshParser] Dedat process: stderr: ' + data);
            }
        });
        worker.on('close', function (code) {
            self.grunt.log.writeln('[BstMeshParser] Dedat process exit with code: ' + code);
            funcReadMeshXml();
        });
    } else {
        funcReadMeshXml();
    }
};

BstMeshParser.prototype.process = function() {
    switch (this.part) {
        case BstMeshParser.PART_BODY:
            this.processBody();
            break;
        case BstMeshParser.PART_FACE:
            this.processFace();
            break;
        case BstMeshParser.PART_HAIR:
            this.processHair();
            break;
        default:
            break;
    }
};

/**
 {
     "$": {
         "alias": "60089_JinF",
         "data-version": "2",
         "description": "",
         "id": "160",
         "name": "60089_수묵의 color vari.",
         "race": "진",
         "resource-name": "00019786.60089_JinF",
         "sex": "여",
         "sub-material-name-1": "00019785.col1",
         "sub-material-name-2": "00019811.col2",
         "type-mesh": "body-mesh"
     }
 },
 {
     "$": {
         "alias": "65070_JinF",
         "data-version": "2",
         "description": "",
         "id": "161",
         "name": "65070_하오방 기녀",
         "race": "진",
         "resource-name": "00020425.65070_JinF",
         "sex": "여",
         "type-mesh": "body-mesh"
     }
 },
 */

BstMeshParser.prototype.processBody = function() {
    this.body = _.filter(this.xml, function(element) {
        return (element['$']['type-mesh'] == BstMeshParser.PART_BODY
            && BstMeshParser.RACE_VALID.indexOf(element['$']['race']) !== -1);
    });
    this.grunt.log.writeln('[BstMeshParser] body-mesh parsed, "' + this.body.length + '" lines of record read.');

    this.crawledData = this.util.readJsonFile('./database/crawler/body/data.json');
    this.grunt.log.writeln('[BstMeshParser] body crawled data loaded, "' + this.crawledData.length + '" lines of record read.');

    _.each(this.body, this.parseBodyElement, this);
};

BstMeshParser.prototype.parseBodyElement = function(element) {
    // this.grunt.log.writeln('[BstMeshParser] Parsing "' + element['$']['alias'] + '" ...');

    var parsedCode = this.utilParseRawCode(element['$']['alias']);
    if (parsedCode === null) {
        this.grunt.log.error('[BstMeshParser] Invalid body-mesh format, alias: ' + element['$']['alias']);
        return; // 这不是一个常规的body mesh数据，忽略它
    }

    var searched = this.utilSearchCrawledData(parsedCode, 'col1'); // FIXME 色指定不能写死
    console.log(parsedCode['codeWithRace'] + ' : ' + JSON.stringify(searched));
};

BstMeshParser.prototype.processFace = function() {

};

BstMeshParser.prototype.processHair = function() {

};

BstMeshParser.prototype.utilParseRawCode = function(rawCode) {
    rawCode = this.util.formatRawCode(rawCode);

    var match = rawCode.match(/\d+_(KunN|JinF|JinM|GonF|GonM|LynF|LynM)/);

    if (match === null) {
        return null;
    }

    var codeWithRace = match[0]; // 40013_GonM
    var code = codeWithRace.substr(0, codeWithRace.indexOf('_')); // 40013
    var race = match[1]; // GonM

    return {
        "codeWithRace": codeWithRace,
        "code": code,
        "race": race
    };
};

BstMeshParser.prototype.utilSearchCrawledData = function(parsedCode, col) {
    var searched;

    // 完全匹配格式：40013_GonM_col1 || 40013_col1_GonM
    searched = _.find(this.crawledData, function(element, key) {
        return (
            key.match(new RegExp(parsedCode['codeWithRace'] + '_' + col)) !== null
            || key.match(new RegExp(parsedCode['code'] + '_' + col + '_' + parsedCode['race'])) !== null
        );
    });
    if (searched !== undefined) { return searched; }

    // 种族不匹配格式：40013_(.*)_col1 || 40013_col1
    searched = _.find(this.crawledData, function(element, key) {
        return (
            key.match(new RegExp(parsedCode['code'] + '_(.*)_' + col)) !== null
                || key.match(new RegExp(parsedCode['code'] + '_' + col)) !== null
            );
    });
    if (searched !== undefined) { return searched; }

    // 色指定不匹配：40013_GonM || 40013_(.*)_GonM
    searched = _.find(this.crawledData, function(element, key) {
        return (
            key.match(new RegExp(parsedCode['codeWithRace'] + '_' + col)) !== null
                || key.match(new RegExp(parsedCode['code'] + '_' + col + '_' + parsedCode['race'])) !== null
            );
    });
    if (searched !== undefined) { return searched; }

    // 种族 & 色指定都不匹配：40013
    searched = _.find(this.crawledData, function(element, key) {
        return key.match(new RegExp(parsedCode['code']));
    });
    if (searched !== undefined) { return searched; }

    return null; // 什么都没找到
};

module.exports = BstMeshParser;