'use strict';

/**
 * @ngdoc filter
 * @name ngPgspeedApp.filter:toArray
 * @function
 * @description
 * # toArray
 * Filter in the ngPgspeedApp.
 */
angular.module('ngPgspeedApp')
  .filter('toArray', function () {
    return function (obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).map(function (key) {
            return Object.defineProperty(obj[key], '$key', {value: key});
        });
    };
  });
