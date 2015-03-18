'use strict';

/**
 * @ngdoc service
 * @name appApp.loading
 * @description
 * # loading
 * Service in the appApp.
 */
angular.module('loading', [])
	.provider('loading', function () {
		var that = this;
		that.pageLoading = true;
		that.httpLoading = 0;

		that.plusHttp = function(num) {
			that.httpLoading+=num;
			if(that.httpLoading>0) {
				$('#loadingProgress').show();
			} else {
				$('#loadingProgress').hide();
			}
		}

		that.$get = function () {
			return {
				pageLoading: that.pageLoading,
				httpLoading: that.httpLoading,
				plusHttp: that.plusHttp
			}
		};
	});
