'use strict';

describe('Controller: PopulatedlistCtrl', function () {

  // load the controller's module
  beforeEach(module('mngApp'));

  var PopulatedlistCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PopulatedlistCtrl = $controller('PopulatedlistCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
