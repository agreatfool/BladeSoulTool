
module.exports = function(grunt) {

    var Task_Default = function() {
        var fs = require('fs');

        var filePath = './00012442.upk';

        var rs = fs.createReadStream(filePath, {encoding: 'utf-8', bufferSize: 11});

        var data = '';
        rs.on("data", function (trunk){
            data += trunk;
        });
        rs.on("end", function () {
            console.log(data);
        });

    };

    grunt.registerTask('default', Task_Default);

};