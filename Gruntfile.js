const RACE_KUN = 'KunN';
const RACE_JIN = 'Jin';
const RACE_GON = 'Gon';
const RACE_LYN = 'Lyn';

const GENDER_MALE   = 'M';
const GENDER_FEMALE = 'F';

var fs = require('fs');
var os = require('os').platform();
var path = require('path');

module.exports = function(grunt) {

    var race = grunt.option('race');
    var model = grunt.option('model');


    var Task_Default = function () {

        grunt.log.writeln('Target race is: ' + race);
        grunt.log.writeln('Target model is: ' + model);

//        var done = this.async();
//
//        var filePath = path.join('resources', '00012442.upk');
//
//        var rs = fs.createReadStream(filePath, {encoding: 'hex', bufferSize: 11});
//
//        var data = '';
//        rs.on("data", function(trunk) {
//            data += trunk;
//        });
//        rs.on("end", function() {
//            console.log(data);
//            done();
//        });

    };

    grunt.registerTask('default', Task_Default);

};