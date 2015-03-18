'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
    .controller('MainCtrl', function ($rootScope, $scope, $window, user, $state, local) {
        $rootScope.model='';
		$rootScope.user = user;
		$rootScope.local = local;

		user.getUser();

		$scope.getUrl = function(id) {
			return local.publicUrl+'/images/'+id+'-s.jpg';
		}

		function resize() {
			$(".scrollable-y").css("height", ($rootScope.windowHeight-250)+"px");
			$(".angular-google-map-container").css("height", ($rootScope.windowHeight-350)+"px");
		}

		$rootScope.windowHeight = $window.innerHeight;
		resize();
		var w = angular.element($window);
		$scope.getWindowDimensions = function () {
			return { 'h': w.height(), 'w': w.width() };
		};
		$scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
			$rootScope.windowHeight = newValue.h;
			$rootScope.windowWidth = newValue.w;
			resize();
		}, true);

		w.bind('resize', function () {
			$scope.$apply();
		});

		$( document ).ready(function() {
			resize();
		});

		$rootScope.goTo = function(state) {
			$state.go(state)
		};
    });