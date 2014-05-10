"use strict";

var cp = require('child_process');
var path = require('path');
var xml2js = require('xml2js');
var _ = require('underscore');
/**
 * @type {BstUtil|exports}
 */
var BstUtil = require('../util/bst_util.js');
/**
 * @type {BstConst|exports}
 */
var BstConst = require('../const/bst_const.js');

var BstMeshParser = function(grunt) {
    this.grunt  = grunt;
    this.util   = new BstUtil(grunt);
    this.parser = new xml2js.Parser();

    this.conf = this.util.readJsonFile('./config/setting.json');
    this.childProcess = this.conf['parser']['childProcess'];
    this.cycleInterval = this.conf['parser']['cycleInterval'];

    this.part = null; // 当前在解析的数据是哪个部分的：body、face、hair
    this.xml  = null; // 读取出来的mesh xml的record列表：<table>[xml => <record></record>]</table>
    this.body = null; // 过滤出所有 type-mesh 是 body-mesh 的数据
    this.face = null; // 过滤出所有 type-mesh 是 accessory-mesh 的数据
    this.hair = null; // 过滤出所有 type-mesh 是 hair-mesh 的数据

    this.crawledData = null; // 从17173站点上爬取到的数据，根据当前的part不同，可能从不同的文件读入
    /**
     * 格式：
     * "65029_LynM_col1": {
     *     "skeleton": "00015031",
     *     "texture": "00015029",
     *     "material": "00015030",
     *     "col1Material": "00015030",
     *     "col": "col1",
     *     "codeWithRace": "65029_LynM",
     *     "code": "65029",
     *     "race": "LynM",
     *     "name": "风客",
     *     "pic": "costume_65029_JinM_col1.png",
     *     "piclink": "http://i1.17173cdn.com/z6po4a/YWxqaGBf/images/data/fashion/big/Costume_65029_JinM_Col1.png",
     *     "link": "http://cha.17173.com/bns/fashion/910270.html"
     * },
     * ...
     */
    this.tmpData = { // 正在处理收集的数据
        "KunN": {},
        "JinF": {},
        "JinM": {},
        "GonF": {},
        "GonM": {},
        "LynF": {},
        "LynM": {}
    };
    this.statusTotalCount = 0; // 总共需要处理的工作计数
    this.statusWorkingCount = 0; // 正在工作的子进程数
    this.statusFinishedCount = 0; // 完成的工作计数
};

BstMeshParser.RACE_VALID = ['곤', '건', '진', '린'];

BstMeshParser.MESH_NAME = 'charactertoolappearance_mesh.xml';

BstMeshParser.prototype.start = function(part) {
    this.util.printHr();
    if ([BstConst.PART_BODY, BstConst.PART_FACE, BstConst.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstMeshParser] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstMeshParser] Start to parse mesh xml of part: ' + part);
    this.util.printHr();

    this.part = part;
    this.dedat();
};

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
        worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
        worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
        worker.on('exit', function (code) {
            self.util.logChildProcessExit('dedat', code);
            funcReadMeshXml();
        });
    } else {
        funcReadMeshXml();
    }
};

BstMeshParser.prototype.process = function() {
    switch (this.part) {
        case BstConst.PART_BODY:
            this.processBody();
            break;
        case BstConst.PART_FACE:
            this.processFace();
            break;
        case BstConst.PART_HAIR:
            this.processHair();
            break;
        default:
            break;
    }
};

BstMeshParser.prototype.processBody = function() {
    this.body = _.filter(this.xml, function(element) {
        return (
            element['$']['type-mesh'] == 'body-mesh' // type-mesh 必须是 body-mesh
            && BstMeshParser.RACE_VALID.indexOf(element['$']['race']) !== -1 // race 种族字符串必须是4大种族中的一个
            && element['$']['resource-name'].match(/\d+\..*/) !== null // resource-name 这一项"."之前必须是一串数字，匹配skeleton upk名字
        );
    });
    this.statusTotalCount = this.body.length;
    this.grunt.log.writeln('[BstMeshParser] body-mesh parsed, "' + this.body.length + '" lines of record read.');

    this.crawledData = this.util.readJsonFile('./database/crawler/body/data.json');
    this.grunt.log.writeln('[BstMeshParser] body crawled data loaded, "' + _.keys(this.crawledData).length + '" lines of record read.');
    this.util.printHr();

    var self = this;
    var timer = setInterval(function() {
        if (self.statusWorkingCount < self.childProcess // 同时并发进程数
            && self.body.length > 0) { // 仍旧还有任务需要安排
            // 进程数有空余，推送任务
            self.parseBodyElement(self.body.shift());
        }
        if (self.statusFinishedCount == self.statusTotalCount) {
            // 任务全部完成
            clearInterval(timer);
            var dataFilePath = './database/costume/' + self.part + '/data.json'; // 使用grunt的write API，所以需要相对于Gruntfile.js的路径
            self.util.printHr();
            self.grunt.log.writeln('[BstMeshParser] All parsing done, start to save file: ' + dataFilePath);
            self.util.writeFile(dataFilePath, self.util.formatJson(self.tmpData));
            self.util.printHr();
            self.grunt.log.writeln('[BstMeshParser] All "' + self.part + '" mesh xml parsed.');
        }
    }, self.cycleInterval);
};

BstMeshParser.prototype.parseBodyElement = function(element) {
    var self = this;

    self.utilStartChildProcess();
    self.grunt.log.writeln('[BstMeshParser] Parsing "' + element['$']['alias'] + '" ... ');

    var parsedCode = self.utilParseRawCode(element['$']['alias']);
    if (parsedCode === null) {
        self.grunt.log.error('[BstMeshParser] Invalid body-mesh format, alias: ' + element['$']['alias']);
        self.utilFinishProcessing(element['$']['alias']); // 因为这条数据在总的this.body内也是占位的，所以也需要标记为完成
        return; // 这不是一个常规的body mesh数据，忽略它
    }

    // 01. 找到skeleton的upk id，并预先定义好默认的texture和material字段
    var skeleton = element['$']['resource-name'].substr(0, element['$']['resource-name'].indexOf('.'));
    var texture;
    var material;

    // 02. 检查skeleton upk是否存在
    var skeletonPath = self.util.findUpkPath(skeleton, function() {
        self.utilFinishProcessing(element['$']['alias']); // 即便文件不存在，也要将其标记为完成
    });
    if (skeletonPath === null) {
        return; // 两个位置upk文件都不存在，只能跳过该mesh配置
    }

    // 03. 启动子进程拆包skeleton upk
    var worker = cp.exec(
        'umodel.exe -export -path=' + path.dirname(skeletonPath) + ' ' +
            '-game=bns -out=' + path.join('output', skeleton) + ' ' + skeleton,
        {"cwd": './resources/umodel/'}
    );
    worker.stdout.on('data', function (data) { self.util.logChildProcessStdout(data); });
    worker.stderr.on('data', function (data) { self.util.logChildProcessStderr(data); });
    worker.on('exit', function (code) {
        self.util.logChildProcessExit('umodel', code);
        funcLoopUmodelOutput();
    });

    // 04. 找出texture和col1的upk id
    var funcLoopUmodelOutput = function() {
        self.grunt.file.recurse('./resources/umodel/output/' + skeleton, function(abspath, rootdir, subdir) {
            /**
             * abspath: resources/umodel/output/00002706/00002704/Texture2D/XLM000_d.tga
             * rootdir: ./resources/umodel/output/00002706
             * subdir: 00002704/Texture2D
             * filename: XLM000_d.tga
             */
            var dirMatch;
            if (abspath.match(/Texture2D/)) {
                dirMatch = subdir.match(/\d+/);
                if (dirMatch == null) {
                    self.grunt.log.error('[BstMeshParser] No Texture2D match when parsing umodel unpacked files: "' + element['$']['alias'] + '" ' + skeleton + '.upk');
                } else {
                    texture = dirMatch[0];
                }
            } else if (abspath.match(/MaterialInstanceConstant/)) {
                dirMatch = subdir.match(/\d+/);
                if (dirMatch == null) {
                    self.grunt.log.error('[BstMeshParser] No MaterialInstanceConstant match when parsing umodel unpacked files: "' + element['$']['alias'] + '" ' + skeleton + '.upk');
                } else {
                    material = dirMatch[0];
                }
            }
        });
        funcCollectData();
    };

    // 05. 组织数据，进行存储
    var funcCollectData = function() {
        // loop查看当前的mesh.xml配置里是否有多色配置项
        var hasMultiMaterial = false; // 是否多色的标识位
        for (var key in element['$']) {
            if (!element['$'].hasOwnProperty(key)) {
                continue;
            }
            var match = key.match(/sub-material-name-(\d+)/);
            if (match !== null) {
                /**
                 * 一般来说 sub-material-name-x 字段里的内容都是工整的：00017534.col14 这样的格式
                 * 但是也会有例外：
                 * 00014113.Cloth_60018_JinM_col1.col11
                 * 00019714.col1_Fur
                 * 00010543.Col3
                 * INTRO_PK.DochunPung_Wet_INST
                 * 60002_GonM_col3
                 * 这样奇怪的格式，所以这里要处理
                 */
                hasMultiMaterial = true;
                var split = element['$'][key].split('.');
                var splitUpkId = null; // 解析出来的upk文件名
                var splitCol = null; // 解析出来的col名

                if (split.length < 2) {
                    continue; // 字段个数都不对，直接退出，e.g 60002_GonM_col3
                }
                if (split[0].match(/\d+/) === null) {
                    continue; // 第一段理论上应该是upk id，如果不是，也不正常，退出，e.g INTRO_PK.DochunPung_Wet_INST
                } else {
                    splitUpkId = split[0];
                }
                splitCol = split[split.length - 1]; // 选取最后一段作为col，e.g 00014113.Cloth_60018_JinM_col1.col11
                if (splitCol.match(/col\d+$|Col\d+$/) === null) {
                    continue; // 如果col不是：col数字 或 Col数字 的格式的话，退出，e.g 00019714.col1_Fur
                }
                splitCol = splitCol.lcfist(); // 将可能的大写首字母转为小写，e.g 00010543.Col3

                funcProcessData(splitCol, splitUpkId);
            }
        }
        if (!hasMultiMaterial) { // 表示当前服装为单色，给默认配置
            funcProcessData('col1', material);
        }
        self.utilFinishProcessing(element['$']['alias']);
    };

    var funcProcessData = function(col, colUpkId) {
        var pk = parsedCode['codeWithRace'] + '_' + col;

        var data = {
            "skeleton": skeleton,
            "texture": texture,
            "material": colUpkId,
            "col1Material": material,
            "col": col,
            "codeWithRace": parsedCode['codeWithRace'],
            "code": parsedCode['code'],
            "race": parsedCode['race'],
            "name": element['$']['name'],
            "pic": null,
            "piclink": null,
            "link": null
        };

        // 如果找到从17173上抓取的数据的话
        var crawledData = self.utilSearchCrawledData(parsedCode, col);
        if (crawledData !== null) {
            data['name'] = crawledData['name'];
            data['pic'] = crawledData['pic'];
            data['piclink'] = crawledData['piclink'];
            data['link'] = crawledData['link'];
        }

        self.tmpData[parsedCode['race']][pk] = data;
    };
};

BstMeshParser.prototype.processFace = function() {

};

BstMeshParser.prototype.processHair = function() {

};

BstMeshParser.prototype.utilStartChildProcess = function() {
    this.statusWorkingCount++;
};

BstMeshParser.prototype.utilStopChildProcess = function() {
    this.statusWorkingCount--;
};

BstMeshParser.prototype.utilFinishProcessing = function(name) {
    this.utilStopChildProcess();
    this.statusFinishedCount++;

    this.grunt.log.writeln('[BstMeshParser] Parsing of "' + name + '" done, ' +
        'progress: ' + this.statusFinishedCount + ' / ' + this.statusTotalCount);
    this.util.printHr();
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

BstMeshParser.prototype.utilSearchCrawledData = function(parsedCode, col) { // col => col1 | col2 ...
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

BstMeshParser.prototype.dataPrepare = function() {
    var self = this;
    /**
     * 在分析mesh.xml的upk信息的时候，我们需要对upk进行解包，
     * 而umodel在执行的时候，需要对应的所有关联upk的信息，因为有一部分是放在tencentPath下，不再bnsPath下，
     * 所以会出现读取不到的问题，这里需要我们预先把tencentPath下的upk拷贝到bnsPath下
     */
    self.grunt.file.recurse(self.util.getTencentPath(), function(abspath, rootdir, subdir, filename) {
        var targetPath = path.join(self.util.getBnsPath(), filename);
        if (!self.grunt.file.exists(targetPath)) {
            // 目标不存在，直接拷贝
            self.util.copyFile(abspath, targetPath);
        } else {
            // 目标已存在，忽略
            self.grunt.log.error('[BstMeshParser] Target upk already exists in bns dir: ' + targetPath);
        }
    });
};

BstMeshParser.prototype.dataCheck = function(part) {
    this.util.printHr();
    if ([BstConst.PART_BODY, BstConst.PART_FACE, BstConst.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstMeshParser] Invalid check part specified: ' + part);
    }
    this.grunt.log.writeln('[BstMeshParser] Start to check data keys of part: ' + part);
    this.util.printHr();

    this.part = part;
    var self = this;

    // 检查所有解析出来的数据中，结构是否是我们预期的，有没有缺失的键值
    var data = self.util.readJsonFile('./database/costume/' + this.part + '/data.json');
    _.each(data, function(raceData) { // 种族键值，这一层直接循环过掉
        _.each(raceData, function(element) { // 具体的数据键值和数据内容
            var hasInvalidKey = self.util.meshDataKeyCheck(element);
            if (hasInvalidKey) {
                self.util.printHr();
            }
        });
    });
};

module.exports = BstMeshParser;