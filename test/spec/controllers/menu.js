'use strict';

describe('Controller: MenuctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('ngPgspeedApp'));

  var MenuctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MenuctrlCtrl = $controller('MenuctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(MenuctrlCtrl.awesomeThings.length).toBe(3);
  });
});
