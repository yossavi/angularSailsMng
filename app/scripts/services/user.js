'use strict';

/**
 * @ngdoc service
 * @name mngApp.admin
 * @description
 * # admin
 * Service in the mngApp.
 */
angular.module('mngApp')
	.service('user', function($cookies, $location, Restangular, $rootScope, $state, local, error) {
		function popupwindow(url, title, w, h) {
			var left = (screen.width/2)-(w/2);
			var top = (screen.height/2)-(h/2);
			return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
		}

		function receiver(event) {
			that.getUser();
			//if (event.origin == local.url) {
			//	if (event.data == "ok") {
			//		that.getUser();
			//	} else {
			//		error.show(event.data);
			//	}
			//} else {
			//	error.show(event.origin+" is not permitted");
			//}
		}

		window.addEventListener('message', receiver, false);

		var that = this;
		that.isUser = false;
		that.isAdmin = false;

		that.login = function(identifier, password, callbak) {
			Restangular.all('auth').all('local').post({
				identifier: identifier,
				password: password
			}).then(function(user) {
				that.getUser(callbak);
			}, function(err) {
				that.loginErr = err.data;
			});
		}

		that.providerLogin = function(provider) {
			var win = popupwindow(local.apiUrl+'/auth/'+provider, "_blank", 800, 800);
		}

		that.register = function(register, callbak) {
			Restangular.all('auth').all('local').all('register').post(register).then(function(user) {
				that.data = user;
				that.isUser = true;
				callbak();
			}, function(err) {
				register.err = err.data;
			});
		}

		that.getUser = function(callback) {
			Restangular.one('user', 'me').get({populate: ['admin']}).then(function(user){
				if (user) {
					that.data = user;
					that.isUser = true;
					that.isAdmin = user.admin && user.admin.level>0;
				}

				if (that.isAdmin) {
					$rootScope.goTo('home');
				} else {
					$rootScope.goTo('login');
				}

				if (callback) {
					callback();
				}
			});
		}

		that.logout = function() {
			Restangular.one('auth', 'logout').get().then(function(ret){
				that.data = {};
				that.isUser = false;
				that.isAdmin = false;
				$rootScope.goTo('login');
			});
		}

		that.$get = function () {
			return {
				isUser: that.isUser,
				isAdmin: that.isAdmin,
				data: that.data,
				login: that.login,
				logout: that.logout,
				providerLogin: that.providerLogin,
				getUser: that.getUser
			}
		};
	});
