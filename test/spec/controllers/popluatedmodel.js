'use strict';

describe('Controller: PopluatedmodelCtrl', function () {

  // load the controller's module
  beforeEach(module('mngApp'));

  var PopluatedmodelCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PopluatedmodelCtrl = $controller('PopluatedmodelCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
