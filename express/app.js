"use strict";

var path = require('path');
var express = require('express');
var cp = require('child_process');
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

app.get('/body/replace/:id', function(req, res) {
    cp.exec(
        'grunt replace --part=body --model=' + req.param('id') + ' --stack',
        {"cwd": '../'},
        function (error, stdout) {
            if (error !== null) {
                console.log('grunt process, stdout: ' + stdout);
                res.send(500, stdout);
            } else {
                res.send(200, 'done!');
            }
        }
    );
});

app.get('/body/restore', function(req, res) {
    cp.exec(
        'grunt restore --stack',
        {"cwd": '../'},
        function (error, stdout) {
            if (error !== null) {
                console.log('grunt process, stdout: ' + stdout);
                res.send(500, stdout);
            } else {
                res.send(200, 'done!');
            }
        }
    );
});

var server = app.listen(35642, function() {
    console.log('Listening on port %d', server.address().port);
});