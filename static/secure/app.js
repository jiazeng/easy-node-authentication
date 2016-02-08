"use strict"


angular.module('user', [])
    .constant('apiRoot', '/app')
    .controller('UserController', function($scope, $http, apiRoot) {    
    $scope.newUser={};
        
    $http.get('/data')
        .then(function(response) {
            $scope.user=response.data;
        });
    });