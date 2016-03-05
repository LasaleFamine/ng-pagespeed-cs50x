'use strict';

describe('Filter: toArray', function () {

  // load the filter's module
  beforeEach(module('ngPgspeedApp'));

  // initialize a new instance of the filter before each test
  var toArray;
  beforeEach(inject(function ($filter) {
    toArray = $filter('toArray');
  }));

  it('should return the input prefixed with "toArray filter:"', function () {
    var text = 'angularjs';
    expect(toArray(text)).toBe('toArray filter: ' + text);
  });

});
