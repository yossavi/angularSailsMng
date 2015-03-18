'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:ItemmodifyCtrl
 * @description
 * # ItemmodifyCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('ItemmodifyCtrl', function ($scope, $interval) {
		//$scope.autoSave = $interval($scope.save, 10000);

		$scope.$on('$destroy', function () {
			//$interval.cancel($scope.autoSave);
			$scope.save();
		});
	});
