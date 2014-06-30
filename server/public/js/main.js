'use strict';

var app = angular.module('Bst', [
    'ngRoute', 'ui.bootstrap',
    'Bst.Controllers', 'Bst.Services'
]);
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/'});
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- CONTROLLERS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var controllers = angular.module('Bst.Controllers', []);
controllers.controller('BstIndexCtrl', [
    '$scope', 'BstService',
function ($scope, service) {
    $scope.listOnPage = [];

    $scope.loadPageData = function() {
        service.loadListOfPage($scope.paginationCurrentPage).then(function(list) {
            $scope.listOnPage = list;
        });
    };

    service.loadTotalItemsCount().then(function(count) {
        $scope.paginationTotalItems = count;
        $scope.paginationCurrentPage = 1;
        $scope.itemsPerPage = 30;
        $scope.paginationMaxButtonsSize = 10;
        $scope.loadPageData(1);
    });

}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- SERVICES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var services = angular.module('Bst.Services', []);
services.factory('BstService', ['$http', '$q', function($http, $q) {
    var list = {}; // pageId => listOnPage

    var loadTotalItemsCount = function() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'issues/total?token=' + getUrlVars()['token'],
            headers: {'Content-type': 'application/x-www-form-urlencoded'}
        }).success(function(result) {
            deferred.resolve(result);
        });
        return deferred.promise;
    };

    var loadListOfPage = function(page) {
        var deferred = $q.defer();
        if (list.hasOwnProperty(page)) {
            deferred.resolve(list[page]);
        } else {
            $http({
                method: 'GET',
                url: 'issues/page/' + page + '?token=' + getUrlVars()['token'],
                headers: {'Content-type': 'application/x-www-form-urlencoded'}
            }).success(function(result) {
                if (typeof result !== 'undefined' && result !== null && result.length > 0) {
                    _.each(result, function(row, rowIndex) {
                        result[rowIndex]['origin'] = angular.fromJson(row['origin']);
                        result[rowIndex]['target'] = angular.fromJson(row['target']);
                        result[rowIndex]['time'] = row['time'] * 1000; // convert unix timestamp to Date
                    });
                    _.sortBy(result, function(row) {
                        return parseInt(row['time']);
                    });
                    deferred.resolve(result);
                } else {
                    deferred.reject([]);
                }
            });
        }
        return deferred.promise;
    };

    return {
        'loadTotalItemsCount': loadTotalItemsCount,
        'loadListOfPage': loadListOfPage
    };
}]);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- ANGULAR BOOTSTRAP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
angular.element(document).ready(function() {
    angular.bootstrap(document, ['Bst']);
});

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//- UTILITIES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}