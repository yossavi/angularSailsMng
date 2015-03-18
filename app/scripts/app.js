'use strict';

/**
 * @ngdoc overview
 * @name mngApp
 * @description
 * # mngApp
 *
 * Main module of the application.
 */

angular
	.module('mngApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ui.router',
		'ngSanitize',
		'ngTouch',
		'restangular',
		'xeditable',
		'cgPrompt',
		'ui.bootstrap',
		'ui.tinymce',
		'flow',
		'ngClipboard',
		'ngMap',
		'permission',
		'error',
		'loading',
		'local'
	])
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('home');
		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'views/main.html',
				controller: 'MainCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('login', {
				url: '/login',
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl',
				data: {
					permissions: {
						except: ['admin'],
						redirectTo: 'home'
					}
				}
			})
			.state('logout', {
				url: '/logout',
				templateUrl: 'views/main.html',
				controller: function ($rootScope) {
					$rootScope.user.logout();
				},
				data: {
					permissions: {
						only: ['user'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist', {
				url: '/mainlist/:model/:mainid/:mainpopulate/:maincollection',
				templateUrl: 'views/mainlist.html',
				controller: 'MainlistCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item', {
				url: '/item/:id',
				templateUrl: 'views/item.html',
				controller: 'ItemCtrl',
				abstract:true,
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.itemmodify', {
				url: '',
				templateUrl: 'views/itemmodify.html',
				controller: 'ItemmodifyCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.populatedlist', {
				url: '/populatedlist/:collection/:populate',
				templateUrl: 'views/populatedlist.html',
				controller: 'PopulatedlistCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.populatedmodel', {
				url: '/populatedmodel/:collection/:populate',
				templateUrl: 'views/populatedmodel.html',
				controller: 'PopulatedmodelCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.images', {
				url: '/images',
				templateUrl: 'views/images.html',
				controller: 'ImagesCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.videos', {
				url: '/videos',
				templateUrl: 'views/videos.html',
				controller: 'VideosCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			.state('mainlist.item.map', {
				url: '/map',
				templateUrl: 'views/map.html',
				controller: 'MapCtrl',
				data: {
					permissions: {
						only: ['admin'],
						redirectTo: 'login'
					}
				}
			})
			;
	})
	.config(function (errorProvider) {
		errorProvider.setError(0, 'no connection');
		errorProvider.setError(404, 'not found');
		errorProvider.setError(9999, 'general error');
	})
	.config(function (RestangularProvider, errorProvider, loadingProvider, localProvider) {
		RestangularProvider.setBaseUrl(localProvider.apiUrl);

		RestangularProvider.addRequestInterceptor(function(element, operation, what, url) {
			loadingProvider.plusHttp(1);
			return element;
		});
		RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
			loadingProvider.plusHttp(-1);
			return data;
		});
		RestangularProvider.setErrorInterceptor(function (response, deferred, responseHandler) {
			loadingProvider.plusHttp(-1);

			if (errorProvider.errors[response.status]) {
				errorProvider.show(response.status);
				return false; // error handled
			} else {
				errorProvider.show(9999);
			}

			return true; // error not handled
		});
	})
	.run(function (editableOptions) {
		editableOptions.theme = 'bs3';
	})
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(false).hashPrefix('!');
	})
	.config(function (flowFactoryProvider) {
		flowFactoryProvider.defaults = {
			//target: 'http://localhost:3001/upload/image',
			permanentErrors:[404, 500, 501],
			testChunks: false,
			chunkSize: 1024*1024*512
		};
	})
	.config(function(ngClipProvider, localProvider) {
		ngClipProvider.setPath(localProvider.publicUrl+'/scripts/zeroclipboard/dist/ZeroClipboard.swf');
	})
	.run(function (Permission, user) {
		Permission.defineRole('admin', function (stateParams) {
			return user.isAdmin;
		});
		Permission.defineRole('user', function (stateParams) {
			return user.isUser;
		});
	})
	.config(function($httpProvider) {
		$httpProvider.defaults.withCredentials = true;
	})
	;
