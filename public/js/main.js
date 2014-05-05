"use strict";

var $html = angular.element(document.getElementsByTagName('html')[0]);
angular.element().ready(function() {
    angular.bootstrap($html, ['BstApp']);
});

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module("BstApp", [
    "ngRoute", "ui.bootstrap",
    "route-segment", "view-segment",
    "BstApp.Controllers", "BstApp.Services"
]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- ROUTES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
app.config([
    "$routeProvider", "$routeSegmentProvider",
function($routeProvider, $routeSegmentProvider) {
    $routeSegmentProvider.options.autoLoadTemplates = true;
    $routeSegmentProvider.options.strictMode = true;
    $routeSegmentProvider.
        when("/body", "body").
        when("/face", "face").
        when("/hair", "hair").
        // BODY
        segment("body", {
            "templateUrl": "view/body/home.html",
            "controller": "BstBodyCtrl"
        }).
        // FACE
        segment("face", {
            "templateUrl": "view/face/home.html",
            "controller": "BstFaceCtrl"
        }).
        // HAIR
        segment("hair", {
            "templateUrl": "view/hair/home.html",
            "controller": "BstHairCtrl"
        });
    $routeProvider.otherwise({redirectTo: "/body"});
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- CONTROLLERS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var controllers = angular.module("BstApp.Controllers", []);

// BstNavCtrl
controllers.controller("BstNavCtrl", [
    "$scope", "$routeSegment",
function ($scope, $routeSegment) {
    console.log("BstNavCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

// BstBodyCtrl
controllers.controller("BstBodyCtrl", [
    "$scope", "$routeSegment", "BstService",
function ($scope, $routeSegment, service) {
    console.log("BstBodyCtrl loaded!");
    $scope.segment = $routeSegment;

    var bodyData = {}; // database/costume/body/data.json
    var racesDisplay = {
        "KunN": "天女", "JinF": "人女", "JinM": "人男",
        "GonF": "龙女", "GonM": "龙男", "LynF": "灵女", "LynM": "灵男"
    };
    $scope.races = []; // 所有的种族名称：['KunN', 'JinF', ...]
    $scope.raceSelected = null; // 选中的种族
    $scope.raceDisplay = null; // 选中的种族的展示名
    $scope.displayData = {}; // 用于显示在页面列表里的模型数据
    $scope.selectedModel = null; // 选中的目标模型id

    $scope.changeRace = function() {
        $scope.raceDisplay = racesDisplay[$scope.raceSelected];
        $scope.displayData = bodyData[$scope.raceSelected];
        $scope.selectedModel = null;
    };

    $scope.selectTableLine = function(modelKey){
        $scope.selectedModel = modelKey;
    };

    service.loadBodyData().then(function(data) {
        bodyData = data;
        $scope.races = _.keys(bodyData);
        $scope.raceSelected = $scope.races[0];
        $scope.changeRace();
    });
}]);

// BstFaceCtrl
controllers.controller("BstFaceCtrl", [
    "$scope", "$routeSegment", "BstService",
function ($scope, $routeSegment, service) {
    console.log("BstFaceCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

// BstHairCtrl
controllers.controller("BstHairCtrl", [
    "$scope", "$routeSegment", "BstService",
function ($scope, $routeSegment, service) {
    console.log("BstHairCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module("BstApp.Services", []);

// BstService
services.factory("BstService", ["$http", "$q", function($http, $q) {

    var loadBodyData = function() {
        var deferred = $q.defer();
        $http({
            method: 'GET', url: 'database/costume/body/data.json'
        }).success(function(data) {
            deferred.resolve(data);
        }).error(function() {
            deferred.reject();
        });
        return spin.run(deferred.promise);
    };

    return {
        "loadBodyData": loadBodyData
    };
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- UTILITY
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var Spin = function() {
    this.spin = new Spinner({
        lines: 15, // The number of lines to draw
        length: 21, // The length of each line
        width: 7, // The line thickness
        radius: 20, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1.0, // Rounds per second
        trail: 60 // Afterglow percentage
    });
    $(document.body).append('<div id="spin-mask" style="display:none;position:fixed;top:50%;left:50%;z-index:200000;"></div>');
};

Spin.prototype.run = function(promise) {
    // start
    this.spin.spin($('#spin-mask').show()[0]);
    // stop
    var self = this;
    if (typeof promise === 'object' && promise.hasOwnProperty('finally')) {
        // this is a promise
        promise['finally'](function() {
            self.spin.stop();
        });
    } else {
        setTimeout(function() {
            self.spin.stop();
        }, 1000);
    }
    return promise;
};

Spin.prototype.stop = function() {
    $('#spin-mask').hide();
    this.spin.stop();
};

var spin = new Spin();

var MsgBox = function() {
    $(document.body).append('<div id="msg-mask" style="display:none;position:fixed;top:50%;right:0;width:50%;z-index:10000;"></div>');
};

MsgBox.prototype.showMessageBox = function(msg, type) {
    if (typeof msg == "object") {
        msg = angular.toJson(msg);
    }
    if (!angular.isString(type)
        || (type != "alert-success" && type != "alert-info"
        && type != "alert-warning" && type != "alert-danger")) {
        type = "alert-success";
    }
    var box = '<div id="msgBox" class="alert ' + type + ' alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert" onclick="msgBox.hideMsgMask();">&times;</button>' +
        '<span>' + msg + '</span>' +
        '</div>';

    $("#msg-mask").append(box).show();
    if (type != "alert-danger") { // if not error message, hide automatically
        setTimeout(function() {
            $("#msgBox").fadeOut(500, function(){ $("#msgBox").remove(); $("#msg-mask").hide(); });
        }, 1500);
    }
};

MsgBox.prototype.hideMsgMask = function() {
    var mask = $("#msg-mask");
    if (mask.children().length <= 0) {
        mask.hide();
    }
};

var msgBox = new MsgBox();