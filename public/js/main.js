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
        when("/body",                                   "body").
        when("/body/module/:moduleName",                "body.apis").
        when("/body/module/:moduleName/api/:apiName",   "body.apis.detail").
        when("/face",                                   "face").
        when("/hair",                                   "hair").
        // BODY
        segment("api", {
            "templateUrl": SZ.VIEW_URL + "admin/api/home.html",
            "controller": "Fs2ApiCtrl"
        }).
        within().
        segment("apis", {
            "templateUrl": SZ.VIEW_URL + "admin/api/apis.html",
            "controller": "Fs2ApiModuleCtrl",
            "dependencies": ["moduleName"]
        }).
        within().
        segment("detail", {
            "templateUrl": SZ.VIEW_URL + "admin/api/detail.html",
            "controller": "Fs2ApiDetailCtrl",
            "dependencies": ["apiName"]
        }).
        up().up().
        // FACE
        segment("data", {
            "templateUrl": SZ.VIEW_URL + "admin/data/home.html",
            "controller": "Fs2DataCtrl"
        }).
        within().
        segment("orm", {
            "templateUrl": SZ.VIEW_URL + "admin/data/orm.html",
            "controller": "Fs2DataOrmCtrl",
            "dependencies": ["ormName"]
        }).
        up().
        // HAIR
        segment("func", {
            "templateUrl": SZ.VIEW_URL + "admin/func/home.html",
            "controller": "Fs2FuncCtrl"
        }).
        within().
        segment("createUser", {
            "templateUrl": SZ.VIEW_URL + "admin/func/create.html",
            "controller": "Fs2FuncCreateUserCtrl"
        }).
        segment("deleteUser", {
            "templateUrl": SZ.VIEW_URL + "admin/func/delete.html",
            "controller": "Fs2FuncDeleteUserCtrl"
        }).
        segment("deleteCache", {
            "templateUrl": SZ.VIEW_URL + "admin/func/delete.html",
            "controller": "Fs2FuncDeleteUserCacheCtrl"
        }).
        segment("flushCache", {
            "templateUrl": SZ.VIEW_URL + "admin/func/execute.html",
            "controller": "Fs2FuncFlushCacheCtrl"
        }).
        segment("readExceptions", {
            "templateUrl": SZ.VIEW_URL + "admin/func/exception.html",
            "controller": "Fs2FuncReadExceptions"
        }).
        segment("tailLog", {
            "templateUrl": SZ.VIEW_URL + "admin/func/log.html",
            "controller": "Fs2FuncTailLog"
        });
    $routeProvider.otherwise({redirectTo: "/api"});
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

// Fs2ApiCtrl
controllers.controller("Fs2ApiCtrl", [
    "$scope", "$routeSegment", "Fs2ApiService",
function ($scope, $routeSegment, service) {
    console.log("Fs2ApiCtrl loaded!");
    $scope.segment = $routeSegment;
    $scope.modules = null;
    service.loadApiModules().then(function(data) {
        if (typeof data === "object" && Object.keys(data).length > 0) {
            $scope.modules = data;
        }
    });
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module("BstApp.Services", []);

// Fs2ApiService
services.factory("Fs2ApiService", ["$http", "$q", function($http, $q) {
    /**
     * {
         *     moduleName: {
         *         apiName: [
         *             0: {
         *                 "name": paramName,
         *                 "type": paramType
         *             },
         *             ...
         *         ],
         *         ...
         *     },
         *     ...
         * }
     */
    var apiData = null;

    var loadApiModules = function() {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: SZ.REQUEST_URL,
            data: app.util.buildAdminReqParams("loadApiModules"),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (app.util.handleResponse(result, false)) { // {moduleName: {}, ...}
                apiData = result.msg[0];
                deferred.resolve(Object.keys(apiData));
            } else {
                deferred.reject();
            }
        });
        return SzSpin.run(deferred.promise);
    };

    var loadModuleApis = function(moduleName) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: SZ.REQUEST_URL,
            data: app.util.buildAdminReqParams("loadModuleApis", [moduleName]),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (app.util.handleResponse(result, false)) { // {apiName: [], ...}
                apiData[moduleName] = result.msg[0];
                deferred.resolve(Object.keys(apiData[moduleName]));
            } else {
                deferred.reject();
            }
        });
        return SzSpin.run(deferred.promise);
    };

    var loadApiDetail = function(moduleName, apiName) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: SZ.REQUEST_URL,
            data: app.util.buildAdminReqParams("loadApiDetail", [moduleName, apiName]),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (app.util.handleResponse(result, false)) { // [0: {"name": paramName, "type": paramType}, ...]
                apiData[moduleName][apiName] = result.msg[0];
                deferred.resolve(apiData[moduleName][apiName]);
            } else {
                deferred.reject();
            }
        });
        return SzSpin.run(deferred.promise);
    };

    var callApi = function(apiName, params) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: SZ.REQUEST_URL,
            data: app.util.buildReqParams(apiName, params),
            headers: {"Content-type": "application/x-www-form-urlencoded"}
        }).success(function(result) {
            if (app.util.handleResponse(result)) {
                deferred.resolve(result);
            } else {
                deferred.reject();
            }
        });
        return SzSpin.run(deferred.promise);
    };

    return {
        "loadApiModules": loadApiModules,
        "loadModuleApis": loadModuleApis,
        "loadApiDetail": loadApiDetail,
        "callApi": callApi
    };
}]);