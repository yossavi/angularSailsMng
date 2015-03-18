'use strict';

describe('Controller: MainlistCtrl', function () {

  // load the controller's module
  beforeEach(module('mngApp'));

  var MainlistCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainlistCtrl = $controller('MainlistCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
