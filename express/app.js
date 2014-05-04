"use strict";

var express = require('express');
var app = express();

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'An error has occurred. Please try again later.');
});

app.get('/', function(req, res){
    res.send(' This is a test ');
});

var server = app.listen(35642, function() {
    console.log('Listening on port %d', server.address().port);
});