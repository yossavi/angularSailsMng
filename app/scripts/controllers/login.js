'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('LoginCtrl', function ($scope, user, $rootScope) {
		$scope.isFb = $rootScope.local.isFb;
		$scope.login = {
			submit: function () {
				user.login($scope.login.usermail, $scope.login.password, function () {
					$rootScope.goTo('home');
				});
			}
		};
		
		$scope.register = {
			submit: function () {
				user.register($scope.register, function () {
					$rootScope.goTo('home');
				});
			}
		};
	});
