'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:PopluatedmodelCtrl
 * @description
 * # PopluatedmodelCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('PopulatedmodelCtrl', function ($rootScope, $scope, $stateParams, Restangular, prompt) {
		$scope.collection = $stateParams.collection;
		$scope.populate = $stateParams.populate;

		function getModel() {
			Restangular.one($rootScope.model, $scope.id).get({
				'limit': 9999,
				'populate': [$scope.populate]
			}).then(function (populateModel) {
				$scope.populateModel = populateModel[$scope.populate];
			});
		}
		getModel();

		Restangular.all($scope.collection).getList({'limit': 9999, 'populate': false}).then(function (list) {
			$scope.list = list;
		});

		$rootScope.showNamePop = undefined;
		Restangular.one($scope.collection, 'definition').get().then(function(definitions) {
			definitions = definitions.plain();

			_.each(definitions, function(value, key) {
				if(value.text && value.text=='show') {
					$rootScope.showNamePop = key;
				}
			});

			if(!$rootScope.showNamePop) {
				$rootScope.showNamePop = 'id';
			}
		});

		$scope.add = function () {
			if ($scope.newPopItem.name instanceof Object) {
				$scope.newPopItem = $scope.newPopItem.name;

				var post = {};
				post[$scope.populate] = $scope.newPopItem.id;
				Restangular.one($rootScope.model, $scope.id).post("",post).then(function () {
					$scope.populateModel = $scope.newPopItem;
				})
			} else {
				Restangular.all($scope.collection).post($scope.newPopItem).then(function (newItem) {
					var post = {};
					post[$scope.populate] = newItem.id;
					Restangular.one($rootScope.model, $scope.id).post("",post).then(function () {
						getModel();
					})
				});
			}
		};

		$scope.addFromList = function(obj) {
			var post = {};
			post[$scope.populate] = obj.id;
			Restangular.one($rootScope.model, $scope.id).post("",post).then(function () {
				$scope.populateModel = obj;
			})
		};
	});
