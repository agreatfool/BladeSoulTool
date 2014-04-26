"use strict";

var fs = require('fs');
var path = require('path');

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

module.exports = function(grunt) {

    //-------------------------------------------------------------------------------------------
    // 工具
    //-------------------------------------------------------------------------------------------
    var Util = function() {
        this.asyncList = [];
    };

    Util.prototype.strUtf8ToHex = function(str) {
        return new Buffer(str).toString('hex');
    };

    Util.prototype.checkFileExists = function(path) {
        if (!grunt.file.exists(path)) {
            grunt.fail.fatal('File not found, path: ' + path);
        }
    };

    Util.prototype.copyFile = function(fromPath, toPath) {
        this.checkFileExists(fromPath);
        grunt.file.copy(fromPath, toPath);
        grunt.log.writeln('Copy file FROM: ' + fromPath + ' , TO: ' + toPath);
    };

    Util.prototype.deleteFile = function(path) {
        this.checkFileExists(path);
        grunt.file.delete(path);
        grunt.log.writeln('Delete file: ' + path);
    };

    Util.prototype.writeHexFile = function(path, data) {
        var buff = new Buffer(data, 'hex');

        grunt.file.write(path, buff, {encoding: 'hex'});

        grunt.log.writeln('Write file: ' + path);
    };

    Util.prototype.readHexFile = function(path, callback) {
        this.checkFileExists(path);

        var data = '';

        var rs = fs.createReadStream(path, {encoding: 'hex', bufferSize: 11});

        rs.on('data', function(trunk) {
            data += trunk;
        });
        rs.on('end', function() {
            callback(data, path);
        });
    };

    Util.prototype.replaceStrAll = function(str, fromStr, toStr) {
        return str.replace(new RegExp(fromStr, 'g'), toStr);
    };

    Util.prototype.replaceStrLast = function(str, fromStr, toStr) {
        return str.substr(0, str.lastIndexOf(fromStr)) + toStr + str.substr(str.lastIndexOf(fromStr) + fromStr.length);
    };

    Util.prototype.registerAsyncEvent = function(eventName) {
        if (this.asyncList.indexOf(eventName) === -1) {
            grunt.log.writeln('Async event registered: ' + eventName);
            this.asyncList.push(eventName);
        }
    };

    Util.prototype.cancelAsyncEvent = function(eventName) {
        var index = this.asyncList.indexOf(eventName);
        if (index !== -1) {
            grunt.log.writeln('Async event cancelled: ' + eventName);
            this.asyncList.remove(index);
        }
    };

    Util.prototype.startToListenAsyncList = function(callback) {
        var self = this;
        var timer = setInterval(function() {
            if (self.asyncList.length == 0) { // all done
                grunt.log.writeln('Async event list done.');
                clearInterval(timer);
                self.asyncList = [];
                callback();
            }
        }, 50);
    };

    var util = new Util();

    // 读取游戏路径配置信息
    var pathConfs = grunt.file.readJSON(path.join('config', 'setting.json'));
    var localPath = pathConfs['path']['tencent'];
    var bnsPath = pathConfs['path']['bns'];
    util.checkFileExists(localPath);
    util.checkFileExists(bnsPath);

    //-------------------------------------------------------------------------------------------
    // 服装修改，一次只能修改一个服装道具
    //-------------------------------------------------------------------------------------------
    var Task_Default = function () {

        this.async(); // 防止grunt在异步事件完成之前就退出

        // 00. 读取命令行输入的信息
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('00. Start to read params from command line: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
        var raceInputted = grunt.option('race');
        var modelInputted = grunt.option('model');
        var colorInputted = grunt.option('mt-col');
        if (colorInputted == 'undefined' || colorInputted == '' || colorInputted == null) {
            colorInputted = 'col1'; // 默认设定为 col1 基础配色
        }

        grunt.log.writeln('Target race is: ' + raceInputted);
        grunt.log.writeln('Target model is: ' + modelInputted);
        grunt.log.writeln('Target color is: ' + colorInputted);

        // 01. 读取对应种族的洪门道服配置信息
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('01. Read source model conf info: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
        var baseConf = grunt.file.readJSON(path.join('database', 'base.json'));
        if (!baseConf.hasOwnProperty(raceInputted)) {
            grunt.fail.fatal('Corresponding conf of race [' + raceInputted + '] cannot be found in config: base.json');
        } else {
            baseConf = baseConf[raceInputted];
            grunt.log.writeln('Source model conf found: ' + JSON.stringify(baseConf));
        }

        // 02. 读取目标服装的配置信息
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('02. Read target model conf info: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
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
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('03. Check the material conf of the target model conf: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
        if (!targetConf['Material'].hasOwnProperty(colorInputted)
            || targetConf['Material'][colorInputted] === '') {
            grunt.fail.fatal('Target model conf has no corresponding material color [' + colorInputted + '] info: ' + JSON.stringify(targetConf));
        } else {
            grunt.log.writeln('Pass.');
        }

        // 04. 在bns下查找目标服装的资源文件是否存在，并拷贝到working文件夹下，顺便改名为对应种族的洪门道服的名称
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('04. Copy & rename source model resources from bns to working dir: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
        var texture = targetConf['Texture'];
        var material = targetConf['Material'][colorInputted];
        var skeleton = targetConf['Skeleton'];
        var workingFiles = {
            'Texture': {
                'bns': path.join(bnsPath, texture + '.upk'),
                'local': path.join(localPath, texture + '.upk'),
                'working': path.join('working', baseConf['Texture'] + '.upk')
            },
            'Material': {
                'bns': path.join(bnsPath, material + '.upk'),
                'local': path.join(localPath, material + '.upk'),
                'working': path.join('working', baseConf['Material']['col1'] + '.upk')
            },
            'Skeleton': {
                'bns': path.join(bnsPath, skeleton + '.upk'),
                'local': path.join(localPath, skeleton + '.upk'),
                'working': path.join('working', baseConf['Skeleton'] + '.upk')
            }
        };
        for (var copyPart in workingFiles) {
            if (!workingFiles.hasOwnProperty(copyPart)) {
                continue;
            }
            if (!grunt.file.exists(workingFiles[copyPart]['bns'])) {
                util.copyFile(workingFiles[copyPart]['local'], workingFiles[copyPart]['working']); // 不在bns下，则去查找tencent下
            } else {
                util.copyFile(workingFiles[copyPart]['bns'], workingFiles[copyPart]['working']); // 一般来说，资源都在bns下
            }
        }

        // 05. 修改文件内模型名
        grunt.log.writeln('-------------------------------------------------------------------------------');
        grunt.log.writeln('05. Modify the model names of model resources in working dir: ');
        grunt.log.writeln('-------------------------------------------------------------------------------');
        var fromModelStr = util.strUtf8ToHex(modelInputted); // 拷贝过来的文件内原来的：目标服装模型名
        var toModelStr = util.strUtf8ToHex(baseConf['Model']); // 改为洪门道服的模型名
        for (var editPart in workingFiles) { // Texture, Material, Skeleton
            if (!workingFiles.hasOwnProperty(editPart)) {
                continue;
            }
            util.registerAsyncEvent(workingFiles[editPart]['working']);
            util.readHexFile(workingFiles[editPart]['working'], function(data, path) {
                util.writeHexFile(path, util.replaceStrAll(data, fromModelStr, toModelStr));
                util.cancelAsyncEvent(path);
            });
        }

        util.startToListenAsyncList(function() { // 所有working目录下的upk内的模型名都替换完成后
            // 06. 修改色指定文件，如果colorInputted不是col1的话
            grunt.log.writeln('-------------------------------------------------------------------------------');
            grunt.log.writeln('06. Fix material info in material upk (if necessary): ');
            grunt.log.writeln('-------------------------------------------------------------------------------');
            if (colorInputted !== 'col1') {
                util.registerAsyncEvent(workingFiles['Material']['working']);
                util.readHexFile(workingFiles['Material']['working'], function(data, path) {
                    util.writeHexFile(path, util.replaceStrLast(
                        data,
                        util.strUtf8ToHex(colorInputted), // 原始：colorInputted
                        util.strUtf8ToHex('col1') // 目标：洪门道服永远是 col1
                    ));
                    util.cancelAsyncEvent(path);
                });
            } else {
                grunt.log.writeln('Default col1, nothing to do.');
            }

            util.startToListenAsyncList(function() { // 色指定文件修改完成
                // 07. 备份文件，如果在backup里已经有同名文件的话，则忽略（因为最早已备份肯定是未被污染的）
                grunt.log.writeln('-------------------------------------------------------------------------------');
                grunt.log.writeln('07. Backup source model resources to backup dir: ');
                grunt.log.writeln('-------------------------------------------------------------------------------');
                /**
                 * 因为目前的换装构造，只允许替换洪门道服，所以不会有额外的upk文件添加到tencent下（都被重命名为洪门道服的upk了）
                 * 所以备份的时候只要检查该种族的洪门道服有没有被备份就OK
                 */
                for (var key in baseConf) {
                    if (!baseConf.hasOwnProperty(key)
                        || ['Texture', 'Material', 'Skeleton'].indexOf(key) === -1) {
                        continue;
                    }
                    var upkName = ((key === 'Material') ? baseConf[key]['col1'] : baseConf[key]) + '.upk';
                    var backupPath = path.join('backup', upkName);
                    // 洪门道服只会在bns下才有，备份的时候将其拷贝到backup下，复原的时候只要删除tencent下对应的文件就好了
                    if (!grunt.file.exists(backupPath)) {
                        util.copyFile(path.join(bnsPath, upkName), backupPath);
                    } else {
                        grunt.log.writeln('Backup file already exists: ' + backupPath);
                    }
                }

                // 08. 拷贝修改后的文件到tencent下，然后将working文件夹清空
                grunt.log.writeln('-------------------------------------------------------------------------------');
                grunt.log.writeln('08. Copy finished model resources to tencent dir & clear working dir: ');
                grunt.log.writeln('-------------------------------------------------------------------------------');
                grunt.file.recurse('working', function(abspath, rootdir, subdir, filename) {
                    /**
                     * 因为只有一层文件夹结构，所以不用担心多层嵌套问题，注意要忽略 working_dir 这个占位文件
                     */
                    if (filename === 'working_dir') { return; }
                    util.copyFile(abspath, path.join(localPath, filename));
                    util.deleteFile(abspath);
                });
            });
        });

    };

    //-------------------------------------------------------------------------------------------
    // 恢复所有修改项
    //-------------------------------------------------------------------------------------------
    var Task_Restore = function() {
        /**
         * 将tencent文件夹下的所有种族的洪门道服全部删除，因为洪门道服本来应该是在bns下的，
         * 所以tencent下的都是因为修改才拷贝过来的，全部删除就是全部还原
         */
        var baseConfs = grunt.file.readJSON(path.join('database', 'base.json'));

        grunt.file.setBase(localPath); // 将当前工作目录转换到tencent文件夹

        for (var raceName in baseConfs) { // 种族层级
            if (!baseConfs.hasOwnProperty(raceName)) {
                continue;
            }
            var raceConf = baseConfs[raceName];
            for (var key in raceConf) { // 种族配置下的各项键
                if (!raceConf.hasOwnProperty(key)
                    || ['Texture', 'Material', 'Skeleton'].indexOf(key) === -1) {
                    continue;
                }
                var upkPath = path.join(
                    localPath, // tencent path
                    ((key == 'Material') ? raceConf[key]['col1'] : raceConf[key]) + '.upk'
                );
                if (grunt.file.exists(upkPath)) {
                    util.deleteFile(upkPath);
                }
            }
        }
    };

    //-------------------------------------------------------------------------------------------
    // Tasks
    //-------------------------------------------------------------------------------------------
    grunt.registerTask('default', Task_Default);
    grunt.registerTask('restore', Task_Restore);

};