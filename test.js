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
var url = 'https://www.google.com.hk/images/srpr/logo11w.png';
var filepath = './database/crawler/pics/dummy/google.png';
console.log('dirname: ' + path.dirname(filepath));
request.head(url, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    var ws = fs.createWriteStream(filepath);
    ws.on('error', function(err) { console.log(err); });

    request(url).pipe(ws).on('close', function() {
        console.log('download done!');
    });
});