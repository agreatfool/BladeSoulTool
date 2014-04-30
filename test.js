"use strict";

var stackTrace = require('stack-trace');
var err = new Error('something went wrong');
var trace = stackTrace.parse(err);

console.log(trace);

var strUc = 'Name!';
var strLc = 'name!';

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lcfist = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

console.log('strUc.lcfist(): ' + strUc.lcfist());
console.log('strUc.ucfirst(): ' + strUc.ucfirst());