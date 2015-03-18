'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:PopulatedlistCtrl
 * @description
 * # PopulatedlistCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
  .controller('PopulatedlistCtrl', function ($rootScope, $scope, $stateParams, Restangular, prompt) {
		$scope.collection = $stateParams.collection;
		$scope.populate = $stateParams.populate;

		Restangular.one($rootScope.model, $scope.id).get({'limit': 9999, 'populate': [$scope.populate]}).then(function(populateList) {
			$scope.populateList = populateList[$scope.populate];
			Restangular.all($scope.collection).getList({'limit': 9999, 'populate': false}).then(function(list) {
				$scope.list = list;

				for (var key in $scope.populateList) {
					var obj = _.find($scope.list, function (obj) {
						return obj.id == $scope.populateList[key].id
					});
					if (obj) {
						$scope.list.splice($scope.list.indexOf(obj), 1);
					}
				}
			});
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

		$scope.add = function() {
			if ($scope.newPopItem.name instanceof Object) {
				$scope.newPopItem = $scope.newPopItem.name;
			}

			Restangular.one($rootScope.model, $scope.id).post($scope.populate, $scope.newPopItem).then(function(newItem) {
				$scope.populateList = newItem[$scope.populate];
			});
		};

		$scope.addFromList = function(obj) {
			Restangular.one($rootScope.model, $scope.id).post($scope.populate, obj).then(function(newItem) {
				$scope.populateList = newItem[$scope.populate];
				$scope.list.splice($scope.list.indexOf(obj), 1);
			});
		};

		$scope.delete = function(index) {
			prompt({
				title: 'Delete this Thing?',
				message: 'Are you sure you want to delete it?'
			}).then(function(){
				Restangular.one($rootScope.model, $scope.id).one($scope.populate, $scope.populateList[index].id).remove().then(function(newItem) {
					$scope.populateList = newItem[$scope.populate];
				});
			});
		};
	});
