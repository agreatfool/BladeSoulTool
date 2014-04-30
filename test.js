"use strict";

var fs = require('fs');
var path = require('path');
var request = require('request');

// stack-trace
var stackTrace = require('stack-trace');
var err = new Error('something went wrong');
var trace = stackTrace.parse(err);

console.log(trace);

var strUc = 'Name!';
var strLc = 'name!';

// String prototype
String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lcfist = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

console.log('strUc.lcfist(): ' + strUc.lcfist());
console.log('strLc.ucfirst(): ' + strLc.ucfirst());

// download image
var fileDownload = function(url, filepath, callback) {
    console.log('Start to download file: ' + url);

    var errReport = function(err) {
        console.log('Error in downloading: ' + url);
        console.log(err);
    };

    request.head(url, function(err, res){
        if (err) { errReport(err); }

        var ws = fs.createWriteStream(filepath);
        ws.on('error', function(err) { errReport(err); });

        request(url).pipe(ws).on('close', function() {
            console.log('File "' + url + '" downloaded: size: ' + res.headers['content-length']);
            callback();
        });
    });
};
fileDownload('https://www.google.com.hk/images/srpr/logo11w.png', './database/crawler/pics/dummy/google.png', function() {
    console.log('done!');
});