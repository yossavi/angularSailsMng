'use strict';

/**
 * @ngdoc function
 * @name mngApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
    .controller('ItemCtrl', function ($scope, $rootScope, $stateParams, $sce, Restangular) {
        $scope.id = $stateParams.id;

		var refreshEditor = _.after(2, function() {
			$scope.editor.setContent($scope.item.body);
		});

		Restangular.one($rootScope.model, $scope.id).get({'populate': false}).then(function(item) {
			$scope.item = item;

			if($rootScope.model == 'place' && $scope.item.body) {
				refreshEditor();
			}

			if($rootScope.model == 'place' && $scope.item.category) {
				for (var keyDef in $scope.definitions) {
					if ($scope.item.category['is_'+keyDef]!= undefined && !$scope.item.category['is_'+keyDef]) {
						$scope.definitions[keyDef].hide = true;
					}
				}
			}
		});

		$scope.save = function() {
			if($rootScope.model == 'place') {
				if($scope.editor) {
					$scope.item.body = $scope.editor.getContent();
				}
			}
			if($scope.item) {
				$scope.item.save();
			}
		};

		$scope.tinymceOptions = {
			resize: false,
			height: 200,
			directionality : 'rtl',
			browser_spellcheck : true,
			object_resizing : true,
			convert_urls: false,
			skin : 'lightgray',
			skin_url: 'http://yossavi.cloudapp.net/anattour/public/scripts/tinymce/skins/lightgray',
			theme : 'modern',
			theme_url: 'http://yossavi.cloudapp.net/anattour/public/scripts/tinymce/themes/modern/theme.min.js',
			plugins: 'image link lists table wordcount hr visualchars visualblocks preview',
			//external_plugins: {
			//	"image": "http://yossavi.cloudapp.net/anattour/public/scripts/tinymce/.js"
			//}
			toolbar: "bold italic underline strikethrough alignleft aligncenter alignright alignjustify styleselect formatselect cut copy paste bullist numlist outdent indent blockquote undo redo removeformat",
			init_instance_callback : function(editor) {
				$scope.editor = editor;
				refreshEditor();
			}
		};

    });
