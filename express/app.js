"use strict";

var path = require('path');
var express = require('express');
var app = express();

//noinspection FunctionWithInconsistentReturnsJS
app.use('*', function(err, req, res, next) {
    if (!err) {
        return next();
    }
    console.error(err.stack);
    res.send(500, 'An error has occurred. Please try again later.');
});

app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
app.use('/database', express.static(path.join(__dirname, '../database')));

var server = app.listen(35642, function() {
    console.log('Listening on port %d', server.address().port);
});