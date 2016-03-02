'use strict';

describe('Service: pgspeed', function () {

  // load the service's module
  beforeEach(module('ngPgspeedApp'));

  // instantiate service
  var pgspeed;
  beforeEach(inject(function (_pgspeed_) {
    pgspeed = _pgspeed_;
  }));

  it('should do something', function () {
    expect(!!pgspeed).toBe(true);
  });

});
