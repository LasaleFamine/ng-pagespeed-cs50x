'use strict';

/**
 * @ngdoc overview
 * @name ngPgspeedApp
 * @description
 * # ngPgspeedApp
 *
 * Main module of the application.
 */
angular
  .module('ngPgspeedApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'googlechart',
    'angulartics', 
    'angulartics.google.analytics'
  ])
  .config(function ($routeProvider, $analyticsProvider) {

    // turn off automatic tracking
    $analyticsProvider.virtualPageviews(false);

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main',
        titlePage: 'Home',
        state: '1'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about',
        titlePage: 'About',
        state: '2'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
