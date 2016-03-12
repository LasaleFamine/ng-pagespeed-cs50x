'use strict';

/**
 * @ngdoc service
 * @name ngPgspeedApp.pageSpeed
 * @description
 * # pageSpeed
 * Factory in the ngPgspeedApp.
 */
angular.module('ngPgspeedApp')
  .factory('pageSpeed', function ($http) {
    // Service logic
    // ...
    var url = 'https://godev.space/pgspeedService/api/exp';
    // Public API here
    return {
      getPageSpeed: function (params) {
        return $http.get(url, {
          params: params 
        }).then(function successCallback(response) {
          return response.data;
        }, function errorCallback(response) {
          return response;
        });
      }
    };
  });
