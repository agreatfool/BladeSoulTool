"use strict";

var RACE_KUN = 'KunN';
var RACE_JIN = 'Jin';
var RACE_GON = 'Gon';
var RACE_LYN = 'Lyn';

var GENDER_MALE   = 'M';
var GENDER_FEMALE = 'F';

var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    var raceInputted = grunt.option('race');
    var modelInputted = grunt.option('model');
    var colorInputted = grunt.option('mt-col');

    var Util = function() {};

    Util.prototype.strUtf8ToHex = function(str) {
        return new Buffer(str).toString('hex');
    };

    Util.prototype.checkFileExists = function(path) {
        if (!grunt.file.exists(path)) {
            grunt.fail.fatal('File not found, path: ' + path);
        }
    };

    Util.prototype.readHexFile = function(path, callback) {
        this.checkFileExists(path);

        var data = '';

        var rs = fs.createReadStream(path, {encoding: 'hex', bufferSize: 11});

        rs.on('data', function(trunk) {
            data += trunk;
        });
        rs.on('end', function() {
            callback(null, data);
        });
    };

    var Task_Default = function () {

        var done = this.async();
        var util = new Util();

        grunt.log.writeln('Target race is: ' + raceInputted);
        grunt.log.writeln('Target model is: ' + modelInputted);
        grunt.log.writeln('Target color is: ' + colorInputted);

        // 01. 读取对应种族的洪门道服配置信息
        var baseConf = grunt.file.readJSON(path.join('database', 'base.json'));
        if (!baseConf.hasOwnProperty(raceInputted)) {
            grunt.fail.fatal('Corresponding conf of race [' + raceInputted + '] cannot be found in config: base.json');
        } else {
            baseConf = baseConf[raceInputted];
            grunt.log.writeln('Source model conf found: ' + JSON.stringify(baseConf));
        }

        // 02. 读取目标服装的配置信息
        var targetConf = null;
        var raceConfs = grunt.file.readJSON(path.join('database', raceInputted + '.json'));
        for (var modelName in raceConfs) {
            if (!raceConfs.hasOwnProperty(modelName)) {
                continue;
            }
            if (modelName == modelInputted) {
                targetConf = raceConfs[modelName];
            }
        }
        if (targetConf === null) {
            grunt.fail.fatal('Target model conf cannot be found in config: ' + raceInputted + '.json');
        } else {
            grunt.log.writeln('Target model conf found: ' + JSON.stringify(targetConf));
        }

        // 03. 检查目标服装的配置信息中，对应的颜色配置是否存在
        if (!targetConf['Material'].hasOwnProperty(colorInputted)
            || targetConf['Material'][colorInputted] === '') {
            grunt.fail.fatal('Target model conf has no corresponding material color [' + colorInputted + '] info: ' + JSON.stringify(targetConf));
        }

        // 04. 在bns下查找目标服装的配置是否存在
        var texture = targetConf['Texture'];
        var material = targetConf['Material'][colorInputted];
        var skeleton = targetConf['Skeleton'];

    };

    grunt.registerTask('default', Task_Default);

};