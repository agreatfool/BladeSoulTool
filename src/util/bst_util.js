"use strict";

var fs = require('fs');

var BstUtil = function(grunt) {
    /** @type {grunt} */
    this.grunt = grunt;

    this.asyncList = [];
};

BstUtil.prototype.printHr = function() {
    this.grunt.log.writeln('-------------------------------------------------------------------------------');
};

BstUtil.prototype.strUtf8ToHex = function(str) {
    var result = new Buffer(str).toString('hex');
    this.grunt.log.writeln('[BstUtil] Convert UTF8 to HEX, FROM: ' + str + ' , TO: ' + result);

    return result;
};

BstUtil.prototype.checkFileExists = function(path) {
    if (!this.grunt.file.exists(path)) {
        this.grunt.fail.fatal('[BstUtil] File not found, path: ' + path);
    }
};

BstUtil.prototype.copyFile = function(fromPath, toPath) {
    this.checkFileExists(fromPath);
    this.grunt.file.copy(fromPath, toPath);
    this.grunt.log.writeln('[BstUtil] Copy file FROM: ' + fromPath + ' , TO: ' + toPath);
};

BstUtil.prototype.deleteFile = function(path) {
    this.checkFileExists(path);
    this.grunt.file.delete(path);
    this.grunt.log.writeln('[BstUtil] Delete file: ' + path);
};

BstUtil.prototype.writeFile = function(path, content) {
    this.grunt.file.write(path, content);
    this.grunt.log.writeln('[BstUtil] Write file: ' + path);
};

BstUtil.prototype.writeHexFile = function(path, data) {
    var buff = new Buffer(data, 'hex');

    this.grunt.file.write(path, buff, {encoding: 'hex'});

    this.grunt.log.writeln('[BstUtil] Write file: ' + path);
};

BstUtil.prototype.readHexFile = function(path, callback) {
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

BstUtil.prototype.replaceStrAll = function(str, fromStr, toStr) {
    return str.replace(new RegExp(fromStr, 'g'), toStr);
};

BstUtil.prototype.replaceStrLast = function(str, fromStr, toStr) {
    return str.substr(0, str.lastIndexOf(fromStr)) + toStr + str.substr(str.lastIndexOf(fromStr) + fromStr.length);
};

BstUtil.prototype.registerAsyncEvent = function(eventName) {
    if (this.asyncList.indexOf(eventName) === -1) {
        this.grunt.log.writeln('[BstUtil] Async event registered: ' + eventName);
        this.asyncList.push(eventName);
    }
};

BstUtil.prototype.cancelAsyncEvent = function(eventName) {
    var index = this.asyncList.indexOf(eventName);
    if (index !== -1) {
        this.grunt.log.writeln('[BstUtil] Async event cancelled: ' + eventName);
        this.asyncList.remove(index);
    }
};

BstUtil.prototype.startToListenAsyncList = function(callback) {
    var self = this;
    var timer = setInterval(function() {
        if (self.asyncList.length == 0) { // all done
            self.grunt.log.writeln('[BstUtil] Async event list done.');
            clearInterval(timer);
            self.asyncList = [];
            if (typeof callback === 'function') {
                callback();
            } else {
                self.grunt.fail.fatal('[BstUtil] Async callback type is invalid: ' + (typeof callback));
            }
        }
    }, 50);
};

module.exports = BstUtil;