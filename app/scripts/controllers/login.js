'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('LoginCtrl', function ($scope) {
		$scope.login = {
			submit: function () {
				user.login($scope.login.usermail, $scope.login.password, function () {
					$rootScope.goTo('home');
				});
			}
		};
	});
