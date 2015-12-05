'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:MainlistCtrl
 * @description
 * # MainlistCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
    .controller('MainlistCtrl', function ($rootScope, $scope, $stateParams, $state, $cookies, Restangular, prompt) {
        $rootScope.model = $stateParams.model;
        $scope.newItem = {};
		$scope.mainid = $stateParams.mainid;
		$scope.mainpopulate = $stateParams.mainpopulate;
		$scope.maincollection = $stateParams.maincollection;
		$scope.filter = $cookies.filter;
		$scope.reverse = $cookies.reverse;

		if ($scope.mainid) {
			$rootScope.model = $scope.maincollection;
			Restangular.one($stateParams.model, $scope.mainid).get({'limit': 9999, 'populate': [$scope.mainpopulate]}).then(function(populateList) {
				$scope.list = populateList[$scope.mainpopulate];
			});
		} else {
			Restangular.all($rootScope.model).getList({'limit': 9999, 'populate': false}).then(function (list) {
				$scope.list = list;
			});
		}

		$rootScope.showName = undefined;
		Restangular.one($rootScope.model, 'definition').get().then(function(definitions) {
			$scope.definitions = definitions.plain();

			_.each($scope.definitions, function(value, key) {
				if(value.text && value.text=='show') {
					$rootScope.showName = key;
				}
			});
			
			if(!$rootScope.showName) {
				$rootScope.showName = 'id';
			}
		});

        $scope.add = function() {
	        if ($scope.mainid) {
		        Restangular.one($stateParams.model, $scope.mainid).post($scope.mainpopulate, $scope.newItem).then(function(newItem) {
			        $scope.list = newItem[$scope.mainpopulate];
			        $state.go('mainlist.item.itemmodify',{model: $rootScope.model, mainid: $scope.mainid, mainpopulate: $scope.mainpopulate, maincollection: $scope.maincollection, id: newItem.id});
		        });
	        } else {
		        Restangular.all($rootScope.model).post($scope.newItem).then(function(newItem) {
			        $scope.list.push(newItem);
			        $state.go('mainlist.item.itemmodify',{model: $rootScope.model, mainid: $scope.mainid, mainpopulate: $scope.mainpopulate, maincollection: $scope.maincollection, id: newItem.id});
		        });
	        }
        };

		$scope.delete = function(id) {
			var obj = _.find($scope.list, function(obj) { return obj.id == id });
			prompt({
				title: 'Delete this Thing?',
				message: 'Are you sure you want to delete it?'
			}).then(function(){
				if ($scope.mainid) {
					Restangular.one($stateParams.model, $scope.mainid).one($scope.mainpopulate, id).remove().then(function(newItem) {
						$scope.list = newItem[$scope.mainpopulate];
					});
				} else {
					obj.remove();
					$scope.list.splice($scope.list.indexOf(obj), 1);
				}
			});
		};

		$scope.cookieOrder = function() {
			$cookies.filter = $scope.filter;
			$cookies.reverse = $scope.reverse;
		}
    });
