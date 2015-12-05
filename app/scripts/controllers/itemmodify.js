'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:ItemmodifyCtrl
 * @description
 * # ItemmodifyCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('ItemmodifyCtrl', function ($scope, $interval, $filter) {
		//$scope.autoSave = $interval($scope.save, 10000);
		
		$scope.showEnum = function(enumArray, enumValue) {
			console.log(enumArray);
			console.log(enumValue);
			var selected = $filter('filter')(enumArray, enumValue);
			return (enumValue && selected.length) ? selected[0] : 'Not set';
		};
		
		$scope.$on('$destroy', function () {
			//$interval.cancel($scope.autoSave);
			$scope.save();
		});
	});
