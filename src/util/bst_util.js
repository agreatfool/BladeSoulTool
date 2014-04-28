var fs = require('fs');

var BstUtil = function(grunt) {
    this.asyncList = [];
    this.grunt = grunt;
};

BstUtil.prototype.strUtf8ToHex = function(str) {
    return new Buffer(str).toString('hex');
};

BstUtil.prototype.checkFileExists = function(path) {
    if (!this.grunt.file.exists(path)) {
        this.grunt.fail.fatal('File not found, path: ' + path);
    }
};

BstUtil.prototype.copyFile = function(fromPath, toPath) {
    this.checkFileExists(fromPath);
    this.grunt.file.copy(fromPath, toPath);
    this.grunt.log.writeln('Copy file FROM: ' + fromPath + ' , TO: ' + toPath);
};

BstUtil.prototype.deleteFile = function(path) {
    this.checkFileExists(path);
    this.grunt.file.delete(path);
    this.grunt.log.writeln('Delete file: ' + path);
};

BstUtil.prototype.writeHexFile = function(path, data) {
    var buff = new Buffer(data, 'hex');

    this.grunt.file.write(path, buff, {encoding: 'hex'});

    this.grunt.log.writeln('Write file: ' + path);
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
        this.grunt.log.writeln('Async event registered: ' + eventName);
        this.asyncList.push(eventName);
    }
};

BstUtil.prototype.cancelAsyncEvent = function(eventName) {
    var index = this.asyncList.indexOf(eventName);
    if (index !== -1) {
        this.grunt.log.writeln('Async event cancelled: ' + eventName);
        this.asyncList.remove(index);
    }
};

BstUtil.prototype.startToListenAsyncList = function(callback) {
    var self = this;
    var timer = setInterval(function() {
        if (self.asyncList.length == 0) { // all done
            self.grunt.log.writeln('Async event list done.');
            clearInterval(timer);
            self.asyncList = [];
            callback();
        }
    }, 50);
};

module.exports = BstUtil;