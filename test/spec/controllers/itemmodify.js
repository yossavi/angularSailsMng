'use strict';

describe('Controller: ItemmodifyCtrl', function () {

  // load the controller's module
  beforeEach(module('mngApp'));

  var ItemmodifyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ItemmodifyCtrl = $controller('ItemmodifyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
