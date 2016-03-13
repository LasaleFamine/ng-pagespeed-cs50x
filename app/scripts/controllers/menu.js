'use strict';

/**
 * @ngdoc function
 * @name ngPgspeedApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the ngPgspeedApp
 */
angular.module('ngPgspeedApp')
  .controller('MenuCtrl', function ($scope, $rootScope, $route, $analytics) {

    // Get the route on changeSuccess
    $scope.states = {};
    $scope.$on('$routeChangeSuccess', function() {
        $rootScope.currentState =  $route.current.$$route.state;
        $rootScope.currentPath = $route.current.$$route.originalPath;
        $rootScope.currentTitle = $route.current.$$route.titlePage;
        $scope.states.activeItem = $rootScope.currentState;
        // Analytics tracking
        $analytics.pageTrack($rootScope.currentPath);
        console.log($rootScope.currentPath);
    });
    
    
    // Menu items
    $scope.items = [{
        id: '1',
        title: 'Home',
        path: '#/'
    }, {
        id: '2',
        title: 'About',
        path: '#/about'
    }];

  });
