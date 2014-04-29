"use strict";

var fs = require('fs');
var xml2js = require('xml2js');

var BstMeshParser = function(grunt) {
    this.grunt = grunt;
    this.parser = new xml2js.Parser();
    this.part = null; // 当前在爬取的数据是哪个部分的：body、face、hair
    this.xml = null; // 读取出来的mesh.xml的record列表：<table>[xml => <record></record>]</table>
};

BstMeshParser.PART_BODY = 'body-mesh';
BstMeshParser.PART_FACE = 'accessory-mesh'; // FIXME 是这么分类的么？ accessory-mesh 应该是 attach 配件的意思
BstMeshParser.PART_HAIR = 'hair-mesh';

BstMeshParser.RACE_GON = '곤';
BstMeshParser.RACE_KUN = '건';
BstMeshParser.RACE_JIN = '진';
BstMeshParser.RACE_LYN = '린';

BstMeshParser.GENDER_M = '남';
BstMeshParser.GENDER_F = '여';

BstMeshParser.prototype.start = function(part) {
    this.util.printHr();
    if ([BstMeshParser.PART_BODY, BstMeshParser.PART_FACE, BstMeshParser.PART_HAIR].indexOf(part) === -1) {
        this.grunt.fail.fatal('[BstMeshParser] Invalid start part specified: ' + part);
    }
    this.grunt.log.writeln('[BstMeshParser] Start to parse mesh xml of part: ' + part);
    this.util.printHr();

    this.part = part;

    var self = this;
    fs.readFile('./resources/mesh.xml', function(readErr, data) {
        if (!readErr) {
            self.grunt.fail.fatal('[BstMeshParser] Error in reading mesh.xml: ' + readErr.stack);
        }
        self.parser.parseString(data, function(parseErr, result) {
            if (!parseErr) {
                self.grunt.fail.fatal('[BstMeshParser] Error in parsing mesh.xml: ' + parseErr.stack);
            }
            self.xml = result['table']['record'];
            self.grunt.log.writeln('[BstMeshParser] mesh.xml parsed, "' + self.xml.length + '" lines of records read.');
            self.process();
        });
    });
};

BstMeshParser.prototype.process = function() {

};

module.exports = BstMeshParser;