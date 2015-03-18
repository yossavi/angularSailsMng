'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:ImagesCtrl
 * @description
 * # ImagesCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('ImagesCtrl', function ($scope, $rootScope, Restangular, prompt) {
		Restangular.one($rootScope.model, $scope.id).get({'limit': 9999, 'populate': ['images']}).then(function(populateList) {
			$scope.images = populateList.images;
		});

		$scope.success = function($message) {
			Restangular.one($rootScope.model, $scope.id).post('images', $message).then(function(newItem) {
				$scope.images = newItem.images;
			});
		}

		$scope.delete = function(id) {
			prompt({
				title: 'Delete this Thing?',
				message: 'Are you sure you want to delete it?'
			}).then(function(){
				Restangular.one($rootScope.model, $scope.id).one('images', id).remove().then(function(newItem) {
					$scope.images = newItem.images;
				});
			});
		}

		$scope.update = function(id) {
			var obj = _.find($scope.images, function(obj) { return obj.id == id });
			Restangular.one('image', id).post("", obj);
		}
	});
