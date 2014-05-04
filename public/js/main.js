"use strict";

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- APP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var app = angular.module("BstApp", [
    "ngAnimate", "ngRoute", "ui.bootstrap",
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
    "$scope", "$routeSegment", "BstBodyService",
function ($scope, $routeSegment, service) {
    console.log("BstBodyCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

// BstFaceCtrl
controllers.controller("BstFaceCtrl", [
    "$scope", "$routeSegment", "BstFaceService",
function ($scope, $routeSegment, service) {
    console.log("BstFaceCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

// BstHairCtrl
controllers.controller("BstHairCtrl", [
    "$scope", "$routeSegment", "BstHairService",
function ($scope, $routeSegment, service) {
    console.log("BstHairCtrl loaded!");
    $scope.segment = $routeSegment;
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module("BstApp.Services", []);

// BstBodyService
services.factory("BstBodyService", ["$http", "$q", function($http, $q) {
    return {};
}]);

// BstFaceService
services.factory("BstFaceService", ["$http", "$q", function($http, $q) {
    return {};
}]);

// BstHairService
services.factory("BstHairService", ["$http", "$q", function($http, $q) {
    return {};
}]);