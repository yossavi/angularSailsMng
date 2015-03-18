'use strict';

/**
 * @ngdoc service
 * @name mngApp.error
 * @description
 * # error
 * Provider in the mngApp.
 */

angular.module('error', []).
	provider('error', function () {

        var that = this;
        that.errors = [];
        that.currentCode = -1;
        that.setError = function (code, error) {
            that.errors[code] = error;
        };

        that.show = function (code) {
			$('#errorModalContent').text(that.errors[code]);
            $('#errorModal').modal('show');
            that.currentCode = code;
        };

		that.custom = function (text) {
			$('#errorModalContent').text(text);
			$('#errorModal').modal('show');
			that.currentCode = -1;
		};

        that.hide = function (code) {
            if (that.currentCode == code) {
                $('#errorModal').modal('hide');
            }
        };

        that.$get = function () {
            return {
                show: that.show,
                hide: that.hide,
	            custom: that.custom
            }
        };
    });
