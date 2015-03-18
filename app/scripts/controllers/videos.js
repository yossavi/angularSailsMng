'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:ImagesCtrl
 * @description
 * # ImagesCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('VideosCtrl', function ($scope, $rootScope, Restangular, prompt, local) {
		Restangular.one($rootScope.model, $scope.id).get({'limit': 9999, 'populate': ['videos']}).then(function(populateList) {
			$scope.videos = populateList.videos;
		});

		$scope.success = function($message) {
			Restangular.one($rootScope.model, $scope.id).post('videos', $message).then(function(newItem) {
				$scope.videos = newItem.videos;
			});
		}

		$scope.delete = function(id) {
			prompt({
				title: 'Delete this Thing?',
				message: 'Are you sure you want to delete it?'
			}).then(function(){
				Restangular.one($rootScope.model, $scope.id).one('videos', id).remove().then(function(newItem) {
					$scope.videos = newItem.videos;
				});
			});
		}

		$scope.updateOrder = function(id) {
			var obj = _.find($scope.videos, function(obj) { return obj.id == id });
			Restangular.one('video', id).post("", {order:  obj.order}).then(function(newItem) {

			});
		}

		$scope.updateDescription = function(id) {
			var obj = _.find($scope.videos, function(obj) { return obj.id == id });
			Restangular.one('video',id).post("", {description:  obj.description}).then(function(newItem) {

			});
		}

		$scope.updateCredit = function(id) {
			var obj = _.find($scope.videos, function(obj) { return obj.id == id });
			Restangular.one('video',id).post("", {credit:  obj.credit}).then(function(newItem) {

			});
		}

		$scope.getVideoUrl = function(id) {
			return local.publicUrl+'/videos/'+id+'.mp4';
		}
	});
