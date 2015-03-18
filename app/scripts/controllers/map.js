'use strict';

/**
 * @ngdoc functisuccess@name mngApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the mngApp
 */
angular.module('mngApp')
	.controller('MapCtrl', function ($scope, $rootScope, $timeout, $compile, $filter, Restangular, prompt) {

		/*
		 Utils
		 */
		$scope.jumped = false;
		function getMarkerIcon(who, icon, color) {
			if (who=='start') {
				var path = fontawesome.markers.SIGN_IN;
				var fillColor = 'green';
				var scale = 0.5;
			}
			if (who=='end') {
				var path = fontawesome.markers.SIGN_OUT;
				var fillColor = 'red';
				var scale = 0.5;
			}
			if (who=='point') {
				if(!fontawesome.markers[icon]) {
					alert(icon+" is not correct")
				}
				var path = fontawesome.markers[icon];
				var fillColor = color ? color :'orange';
				var scale = 0.3;
			}
			return {
				path: path,
				scale: scale,
				strokeWeight: 0.1,
				strokeColor: 'black',
				strokeOpacity: 1,
				fillColor: fillColor,
				fillOpacity: 1
			}
		}

		/*
		General lists
		 */
		Restangular.all('color').getList({populate: 'false', limit: 1000}).then(function (colors) {
			$scope.colors = colors;
		});

		Restangular.all('adjust_for').getList({populate: 'false', limit: 1000}).then(function (adjustFors) {
			$scope.adjustFors = adjustFors;
		});

		Restangular.all('interest_point_cat').getList({populate: 'false', limit: 1000}).then(function (interestPointCats) {
			$scope.interestPointCats = interestPointCats;
		});


		$scope.$on('mapInitialized', function(evt, map) {

			$scope.startEndPoints = {
				dirty: true,
				models: [],
				isstart: false,
				isend: false
			}

			$scope.curRoutes = {
				dirty: true,
				models: []
			}

			$scope.curInterestPoints = {
				dirty: true,
				models: []
			}

			$scope.otherRoutes = {
				models: [],
				cache: [],
				already: [],
				infowindow: new google.maps.InfoWindow()
			}

			$scope.otherPlaces = {
				models: [],
				cache: [],
				already: [],
				infowindow: new google.maps.InfoWindow()
			}

			$scope.otherInterestPoints = {
				models: [],
				cache: [],
				already: [],
				infowindow: new google.maps.InfoWindow()
			}

			/*
			draw on map
			 */
			$scope.refreshModel = function () {
				var bounds = $scope.map.getBounds();
				var zoom = $scope.map.getZoom();
				var center = $scope.map.getCenter();

				//console.log('zoom: '+zoom+ 'center: '+center.lat()+','+center.lng()+' boundsDis: '+(bounds.getNorthEast().lat()-center.lat())+', '+(bounds.getNorthEast().lng()-center.lng()));

				///*
				//get other routes
				//*/
				if ($scope.all || zoom > 11) {
					var curCenter = {
						lat: Math.ceil(center.lat()*10),
						lng: Math.ceil(center.lng()*2)
					}
					var curBounds = {
						ne: {
							lat: curCenter.lat/10+0.1,
							lng: curCenter.lng/2+0.5
						},
						sw: {
							lat: curCenter.lat/10-0.1,
							lng: curCenter.lng/2-0.5
						}
					}

					//console.log(curCenter.lat+", "+curCenter.lng+": "+curBounds.ne.lat+", "+curBounds.ne.lng+": "+curBounds.sw.lat+", "+curBounds.sw.lng);
					if ($scope.all || (!$scope.otherRoutes.cache[curCenter.lat] || !$scope.otherRoutes.cache[curCenter.lat][curCenter.lng])) {
						$scope.all = false;
						if(!$scope.otherRoutes.cache[curCenter.lat]) {
							$scope.otherRoutes.cache[curCenter.lat] = [];
						}
						$scope.otherRoutes.cache[curCenter.lat][curCenter.lng] = true;

						Restangular.all('route').getList({
							where: {
								'swlat': {'<': curBounds.ne.lat},
								'swlng': {'<': curBounds.ne.lng},
								'nelat': {'>': curBounds.sw.lat},
								'nelng': {'>': curBounds.sw.lng}
							},
							populate: ['color', 'adjust_for'], limit: 1000
						}).then(function (routes) {
							for (var i = 0; i < routes.length; i++) {
								if($scope.otherRoutes.already[routes[i].id]) {
									continue;
								} else {
									$scope.otherRoutes.already[routes[i].id] = true;
								}
								var poly = new google.maps.Polyline({
									path: routes[i].path,
									strokeColor: routes[i].color ? tinycolor(routes[i].color.color).desaturate(60).toString() : '#000',
									strokeWeight: 2,
									editable: true,
									map: $scope.map,
									db: routes[i],
									zIndex: 10
								});
								$scope.otherRoutes.models.push(poly);
								google.maps.event.addListener(poly, 'mouseup', (function(index) {
									return function() {
										var polyline = $scope.otherRoutes.models[index];

										Restangular.one('route', polyline.db.id).get({populate: false}).then(function (route) {
											route.path = JSON.stringify(polyline.getPath().getArray());
											route.save();
										});
									};
								})($scope.otherRoutes.models.length-1));
								google.maps.event.addListener(poly, 'click', (function( index ){
									return function(event){
										$scope.$apply(function() {
											var polyline = $scope.otherRoutes.models[index];
											var selected = $filter('filter')($scope.adjustFors, {id: polyline.db.adjust_for ? polyline.db.adjust_for.id : null});
											$scope.selectedAdjustFor = polyline.db.adjust_for ? selected[0].name : 'Not set';

											var content = '<div style="width: 350px; height: 100px"><br>Number: <span class="title">' +
												'<a href="" editable-text="otherRoutes.models['+index+'].db.number" onaftersave="updateOtherRoute(\''+polyline.db.id+'\', \''+index+'\')">'+(polyline.db.number || 'empty')+' </a>' +
												'</span>' +
												'<br>Adjust for: <span class="title">' +
												'<a href="#" editable-select="otherRoutes.models['+index+'].db.adjust_for" e-ng-options="adjustFor.id as adjustFor.name for adjustFor in adjustFors" onaftersave="updateOtherRoute(\''+polyline.db.id+'\', \''+index+'\')" >{{ selectedAdjustFor }}</a>' +
												'</span><br>' +
												'<button class="btn btn-sm btn-success" ng-click="relateOtherRoute(\''+index+'\')">Relate</button>'+
												'<button class="btn btn-sm btn-danger" ng-click="deleteOtherRoute(\''+index+'\')">Delete</button>'+
												'</div>';
											var compiled = $compile(content)($scope);
											$scope.otherRoutes.infowindow.setContent( compiled[0] );
											$scope.otherRoutes.infowindow.setPosition( event.latLng );
											$scope.otherRoutes.infowindow.open( $scope.map );
										})
									};
								})($scope.otherRoutes.models.length-1));
							}
						});

					}
				}
				/*
				get other places
				*/
				if ($scope.all || zoom > 6) {
					var curCenter = {
						lat: Math.ceil(center.lat()),
						lng: Math.ceil(center.lng())
					}
					var curBounds = {
						ne: {
							lat: curCenter.lat+1,
							lng: curCenter.lng+1
						},
						sw: {
							lat: curCenter.lat-1,
							lng: curCenter.lng-1
						}
					}

					if ($scope.all || (!$scope.otherPlaces.cache[curCenter.lat] || !$scope.otherPlaces.cache[curCenter.lat][curCenter.lng])) {
						$scope.all = false;
						if (!$scope.otherPlaces.cache[curCenter.lat]) {
							$scope.otherPlaces.cache[curCenter.lat] = [];
						}
						$scope.otherPlaces.cache[curCenter.lat][curCenter.lng] = true;

						var where = {
							'latitude': {'<': curBounds.ne.lat, '>': curBounds.sw.lat},
							'longitude': {'<': curBounds.ne.lng, '>': curBounds.sw.lng}
						};
						where.hasPlaces = true;

						Restangular.all('location').getList({
							where: where, populate: ['places_start'], limit: 1000
						}).then(function (locations) {
							for (var i = 0; i < locations.length; i++) {
								if($scope.otherPlaces.already[locations[i].id]) {
									continue;
								} else {
									$scope.otherPlaces.already[locations[i].id] = true;
								}
								for (var j = 0; j < locations[i].places_start.length; j++) {
									var marker = new google.maps.Marker({
										position: {
											lat: locations[i].latitude,
											lng: locations[i].longitude
										},
										title: locations[i].places_start[j].name,
										map: $scope.map,
										icon: getMarkerIcon('start'),
										id: locations[i].places_start[j].id,
										zIndex: 10
									});
									$scope.otherPlaces.models.push(marker);
								}
							}
						});
					}
				}

				/*
				 get other interest points
				 */
				if ($scope.all || zoom > 13) {

					var curCenter = {
						lat: Math.ceil(center.lat()*20),
						lng: Math.ceil(center.lng()*10)
					}
					var curBounds = {
						ne: {
							lat: curCenter.lat/20+0.05,
							lng: curCenter.lng/10+0.1
						},
						sw: {
							lat: curCenter.lat/20-0.05,
							lng: curCenter.lng/10-0.1
						}
					}

					if ($scope.all || (!$scope.otherInterestPoints.cache[curCenter.lat] || !$scope.otherInterestPoints.cache[curCenter.lat][curCenter.lng])) {
						$scope.all = false;
						if (!$scope.otherInterestPoints.cache[curCenter.lat]) {
							$scope.otherInterestPoints.cache[curCenter.lat] = [];
						}
						$scope.otherInterestPoints.cache[curCenter.lat][curCenter.lng] = true;

						var where = {
							'latitude': {'<': curBounds.ne.lat, '>': curBounds.sw.lat},
							'longitude': {'<': curBounds.ne.lng, '>': curBounds.sw.lng}
						};
						//where.hasInterest_points = true;

						Restangular.all('location').getList({
							where: where, populate: ['interest_points'], limit: 1000
						}).then(function (locations) {
							for (var i = 0; i < locations.length; i++) {
								if($scope.otherInterestPoints.already[locations[i].id]) {
									continue;
								} else {
									$scope.otherInterestPoints.already[locations[i].id] = true;
								}
								for (var j = 0; j < locations[i].interest_points.length; j++) {
									var interestPointCat = _.find($scope.interestPointCats, function (obj) {
										return obj.id == locations[i].interest_points[j].interest_point_cat
									});
									if (!interestPointCat) {
										continue;
									}
									var marker = new google.maps.Marker({
										position: {
											lat: locations[i].latitude,
											lng: locations[i].longitude
										},
										title: locations[i].name ? locations[i].name : 'empty',
										map: $scope.map,
										draggable: true,
										icon: getMarkerIcon('point', interestPointCat.icon, 'yellow'),
										db: locations[i].interest_points[j],
										locDb: locations[i],
										zIndex: 10
									});
									$scope.otherInterestPoints.models.push(marker);

									google.maps.event.addListener(marker, 'dragend', (function(index) {
										return function() {
											var marker = $scope.otherInterestPoints.models[index];
											Restangular.one('interest_point', marker.db.id).get({populate: ['loc']}).then(function (interestPoint) {
												interestPoint.loc.latitude = marker.getPosition().lat();
												interestPoint.loc.longitude = marker.getPosition().lng();
												interestPoint.save();
											});
										};
									})($scope.otherInterestPoints.models.length-1));
									google.maps.event.addListener(marker, 'click', (function( index ){
										return function(){
											$scope.$apply(function() {
												var marker = $scope.otherInterestPoints.models[index];
												var content = '<div style="width: 350px; height: 100px"><br>Name: <span class="title">' +
													'<a href="" editable-text="otherInterestPoints.models['+index+'].locDb.name" onaftersave="updateOtherInterestPoint(\''+marker.db.id+'\', \''+index+'\')">{{ otherInterestPoints.models['+index+'].locDb.name || \'empty\' }}</a></span>' +
													'<br>' +
													'<button class="btn btn-sm btn-success" ng-click="relateOtherInterestPoint(\''+index+'\')">Relate</button>'+
													'<button class="btn btn-sm btn-danger" ng-click="deleteOtherInterestPoint(\''+marker.db.id+'\', \''+index+'\')">Delete</button>'+
													'</div>';
												var compiled = $compile(content)($scope);
												$scope.otherInterestPoints.infowindow.setContent( compiled[0] );
												$scope.otherInterestPoints.infowindow.open( $scope.map ,  marker);
											})
										};
									})($scope.otherInterestPoints.models.length-1));
								}
							}
						});
					}
				}

				/*
				 get this place related data
				 */
				if ($scope.startEndPoints.dirty || $scope.curRoutes.dirty || $scope.curInterestPoints.dirty) {
					Restangular.one($rootScope.model, $scope.id).get({
						'populate': ['loc_start', 'loc_end', 'routes', 'interest_points']
					}).then(function (populateModel) {
						$scope.populateModel = populateModel;

						/*
						 set start / end points
						 */
						if ($scope.startEndPoints.dirty) {
							$scope.startEndPoints.dirty = false;
							while ($scope.startEndPoints.models.length) {
								$scope.startEndPoints.models.pop().setMap(null);
							}
							if (populateModel.loc_start) {
								var marker = new google.maps.Marker({
									position: {
										lat: populateModel.loc_start.latitude,
										lng: populateModel.loc_start.longitude
									},
									title: 'loc_start',
									map: $scope.map,
									draggable: true,
									icon: getMarkerIcon('start'),
									zIndex: 20
								});
								$scope.startEndPoints.models.push(marker);
								if (!$scope.jumped) {
									$timeout(function () {
										$scope.map.panTo({
											lat: populateModel.loc_start.latitude,
											lng: populateModel.loc_start.longitude
										});
										$scope.map.setZoom(17);
									});

									$scope.jumped = true;
								}
								$scope.startEndPoints.isstart = true;
							}
							if (populateModel.loc_end) {
								var marker = new google.maps.Marker({
									position: {
										lat: populateModel.loc_end.latitude,
										lng: populateModel.loc_end.longitude
									},
									title: 'loc_end',
									map: $scope.map,
									draggable: true,
									icon: getMarkerIcon('end'),
									zIndex: 20
								});
								$scope.startEndPoints.models.push(marker);
								$scope.startEndPoints.isend = true;
							}
							$scope.startEndPoints.infowindow = new google.maps.InfoWindow();

							for(var i=0; i<$scope.startEndPoints.models.length; i++) {
								google.maps.event.addListener($scope.startEndPoints.models[i], 'dragend', (function(index) {
									return function() {
										var marker = $scope.startEndPoints.models[index];
										$scope.populateModel[marker.title].latitude = marker.getPosition().lat();
										$scope.populateModel[marker.title].longitude = marker.getPosition().lng();
										$scope.updateStartEndPoint();
									};
								})(i));
								google.maps.event.addListener($scope.startEndPoints.models[i], 'click', (function( index ){
									return function(){
										$scope.$apply(function() {
											var marker = $scope.startEndPoints.models[index];
											var content = '<div style="width: 350px; height: 50px"><br>Name: <span class="title"> <a href="" editable-text="populateModel[\''+marker.title+'\'].name" onaftersave="updateStartEndPoint()">{{ populateModel[\''+marker.title+'\'].name || \'empty\' }}</a></span> </div>';
											var compiled = $compile(content)($scope);
											$scope.startEndPoints.infowindow.setContent( compiled[0] );
											$scope.startEndPoints.infowindow.open( $scope.map ,  marker);
										})
									};
								})(i));
							}
						}

						/*
						set current routes
						 */
						if ($scope.curRoutes.dirty) {
							$scope.curRoutes.dirty = false;
							while ($scope.curRoutes.models.length) {
								$scope.curRoutes.models.pop().setMap(null);
							}
							for (var i = 0; i < populateModel.routes.length; i++) {
								if (populateModel.routes[i].color) {

									var color = _.find($scope.colors, function (obj) {
										return obj.id == populateModel.routes[i].color
									});

									var polyline = new google.maps.Polyline({
										path: populateModel.routes[i].path,
										strokeColor: color.color? color.color: '#000',
										strokeWeight: 3,
										editable: true,
										map: $scope.map,
										id: populateModel.routes[i].id,
										zIndex: 20
									});
									$scope.curRoutes.models.push(polyline);
								}
							}

							$scope.curRoutes.infowindow = new google.maps.InfoWindow();

							for(var i=0; i<$scope.curRoutes.models.length; i++) {
								google.maps.event.addListener($scope.curRoutes.models[i], 'mouseup', (function(index) {
									return function() {
										var polyline = $scope.curRoutes.models[index];

										Restangular.one('route', polyline.id).get({populate: false}).then(function (route) {
											route.path = JSON.stringify(polyline.getPath().getArray());
											route.save();
										});
									};
								})(i));
								google.maps.event.addListener($scope.curRoutes.models[i], 'click', (function( index ){
									return function(event){
										$scope.$apply(function() {
											var selected = $filter('filter')($scope.adjustFors, {id: $scope.populateModel.routes[index].adjust_for});
											$scope.selectedAdjustFor = $scope.populateModel.routes[index].adjust_for ? selected[0].name : 'Not set';
											var content = '<div style="width: 350px; height: 100px"><br>Number: <span class="title">' +
												'<a href="" editable-text="populateModel.routes['+index+'].number" onaftersave="updateCurRoute('+index+')">{{ populateModel.routes['+index+'].number || \'empty\' }}</a>' +
												'</span>' +
												'<br>Adjust for: <span class="title">' +
												'<a href="#" editable-select="populateModel.routes['+index+'].adjust_for" e-ng-options="adjustFor.id as adjustFor.name for adjustFor in adjustFors" onaftersave="updateCurRoute('+index+')" >{{ selectedAdjustFor }}</a>' +
												'</span><br>' +
												'<button class="btn btn-sm btn-danger" ng-click="unrelateCurRoute('+index+')">Unrelate</button>'+
												'</div>';
											var compiled = $compile(content)($scope);
											$scope.curRoutes.infowindow.setContent( compiled[0] );
											$scope.curRoutes.infowindow.setPosition( event.latLng );
											$scope.curRoutes.infowindow.open( $scope.map );
										})
									};
								})(i));
							}
						}

						/*
						set current interest points
						 */
						function pushPoint(i) {
							if (i < populateModel.interest_points.length) {
								Restangular.one('interest_point', populateModel.interest_points[i].id).get({
									'populate': ['loc']
								}).then(function (interest_point) {
									$scope.populateModel.interest_points[i].loc = interest_point.loc;
									var interestPointCat = _.find($scope.interestPointCats, function (obj) {
										return obj.id == populateModel.interest_points[i].interest_point_cat
									});
									if (!interestPointCat) {
										pushPoint(i + 1);
										return;
									}
									var marker = new google.maps.Marker({
										position: {
											lat: interest_point.loc.latitude,
											lng: interest_point.loc.longitude
										},
										title: interestPointCat.name,
										map: $scope.map,
										draggable: true,
										icon: getMarkerIcon('point', interestPointCat.icon),
										id: $scope.populateModel.interest_points[i].id,
										zIndex: 20
									});
									$scope.curInterestPoints.models.push(marker);

									pushPoint(i + 1);
								});
							} else {
								$scope.curInterestPoints.infowindow = new google.maps.InfoWindow();

								for(var i=0; i<$scope.curInterestPoints.models.length; i++) {
									google.maps.event.addListener($scope.curInterestPoints.models[i], 'dragend', (function(index) {
										return function() {
											var marker = $scope.curInterestPoints.models[index];
											Restangular.one('interest_point', marker.id).get({populate: ['loc']}).then(function (interestPoint) {
												interestPoint.loc.latitude = marker.getPosition().lat();
												interestPoint.loc.longitude = marker.getPosition().lng();
												interestPoint.save();
											});
										};
									})(i));
									google.maps.event.addListener($scope.curInterestPoints.models[i], 'click', (function( index ){
										return function(){
											$scope.$apply(function() {
												var marker = $scope.curInterestPoints.models[index];
												$scope.currentCurInterestPoint = _.findKey($scope.populateModel.interest_points, function (obj) {
													return obj.id == marker.id;
												});
												var content = '<div style="width: 350px; height: 100px"><br>Name: <span class="title">' +
													'<a href="" editable-text="populateModel.interest_points['+index+'].loc.name" onaftersave="updateCurInterestPoint('+index+')">{{ populateModel.interest_points['+index+'].loc.name || \'empty\' }}</a></span>' +
													'<br> <button class="btn btn-sm btn-danger" ng-click="unrelateCurInterestPoint('+index+')">Unrelate</button></div>';
												var compiled = $compile(content)($scope);
												$scope.curInterestPoints.infowindow.setContent( compiled[0] );
												$scope.curInterestPoints.infowindow.open( $scope.map ,  marker);
											})
										};
									})(i));
								}
							}
						}
						if ($scope.curInterestPoints.dirty) {
							$scope.curInterestPoints.dirty = false;
							while ($scope.curInterestPoints.models.length) {
								$scope.curInterestPoints.models.pop().setMap(null);
							}
							pushPoint(0);
						}
					});
				}

				/*
				autocomplete search
				 */
				var map = $scope.map;

				var input = /** @type {HTMLInputElement} */(
					document.getElementById('pac-input'));

				//map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

				var autocomplete = new google.maps.places.Autocomplete(input);
				autocomplete.bindTo('bounds', map);

				var infowindow = new google.maps.InfoWindow();
				var marker = new google.maps.Marker({
					map: map,
					anchorPoint: new google.maps.Point(0, -29)
				});

				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					infowindow.close();
					marker.setVisible(false);
					var place = autocomplete.getPlace();
					if (!place.geometry) {
						return;
					}

					// If the place has a geometry, then present it on a map.
					if (place.geometry.viewport) {
						map.fitBounds(place.geometry.viewport);
					} else {
						map.setCenter(place.geometry.location);
						map.setZoom(17);  // Why 17? Because it looks good.
					}
					marker.setIcon(/** @type {google.maps.Icon} */({
						url: place.icon,
						size: new google.maps.Size(71, 71),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(17, 34),
						scaledSize: new google.maps.Size(35, 35)
					}));
					marker.setPosition(place.geometry.location);
					marker.setVisible(true);

					var address = '';
					if (place.address_components) {
						address = [
							(place.address_components[0] && place.address_components[0].short_name || ''),
							(place.address_components[1] && place.address_components[1].short_name || ''),
							(place.address_components[2] && place.address_components[2].short_name || '')
						].join(' ');
					}

					infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
					infowindow.open(map, marker);
				});
			}


			$scope.addMarker = function (who) {
				$scope.drawingMarker = new google.maps.drawing.DrawingManager({
					drawingMode: google.maps.drawing.OverlayType.MARKER,
					drawingControl: false,
					markerOptions: {
						icon: getMarkerIcon(who, $scope.pickedInterestPointCat ? $scope.pickedInterestPointCat.icon: null)
					}
				});
				$scope.drawingMarker.setMap($scope.map);
				$scope.who = who;
				google.maps.event.addListener($scope.drawingMarker, 'markercomplete', function (marker) {
					if ($scope.drawingMarker.getDrawingMode()) {
						$scope.drawingMarker.setDrawingMode(null);

						Restangular.all("location").post({
							latitude: marker.getPosition().lat(),
							longitude: marker.getPosition().lng()
						}).then(function (newItem) {
							if ($scope.who=='start' || $scope.who == 'end') {
								var post = {};
								post["loc_" + $scope.who] = newItem.id;
								Restangular.one($rootScope.model, $scope.id).post("", post).then(function (newModel) {
									$scope.startEndPoints.dirty = true;
									$scope.refreshModel();
									marker.setMap(null);
								})
							} else {
								Restangular.one($rootScope.model, $scope.id).post('interest_points', {
									interest_point_cat: $scope.pickedInterestPointCat,
									loc: newItem
								}).then(function (newModel) {
									$scope.curInterestPoints.dirty = true;
									$scope.refreshModel();
									marker.setMap(null);
								});
							}
						});
						$scope.drawingMarker.setMap(null);
					}
				});
			}

			$scope.addRoute = function () {
				$scope.drawingPolyline = new google.maps.drawing.DrawingManager({
					drawingMode: google.maps.drawing.OverlayType.POLYLINE,
					drawingControl: false,
					polylineOptions : {
						strokeColor: $scope.pickedColor.color,
						strokeOpacity: 1.0,
						strokeWeight: 3,
						editable: true
					}
				});
				$scope.drawingPolyline.setMap($scope.map);

				google.maps.event.addListener($scope.drawingPolyline, 'polylinecomplete', function (polyline) {
					if ($scope.drawingPolyline.getDrawingMode()) {
						$scope.drawingPolyline.setDrawingMode(null);

						Restangular.one($rootScope.model, $scope.id).post('routes', {
							color: $scope.pickedColor,
							path:  JSON.stringify(polyline.getPath().getArray())
						}).then(function (newItem) {
							$scope.curRoutes.dirty = true;
							$scope.refreshModel();
							polyline.setMap(null);
						});

						$scope.drawingPolyline.setMap(null);
					}
				});
			}

			$scope.updateStartEndPoint = function() {
				$scope.startEndPoints.infowindow.close();
				$scope.populateModel.save();
			}

			$scope.updateCurRoute = function(i) {
				$scope.curRoutes.infowindow.close();
				Restangular.one('route', $scope.populateModel.routes[i].id).get({populate: false}).then(function (route) {
					route.number = $scope.populateModel.routes[i].number;
					route.adjust_for = $scope.populateModel.routes[i].adjust_for;
					route.save();
				});
			}

			$scope.unrelateCurRoute = function(i) {
				$scope.curRoutes.infowindow.close();
				Restangular.one($rootScope.model, $scope.id).one('routes', $scope.populateModel.routes[i].id).remove().then(function(newItem) {
					$scope.curRoutes.dirty=true;
					$scope.refreshModel();
				});
			}

			$scope.updateOtherRoute = function(id, i) {
				$scope.otherRoutes.infowindow.close();
				Restangular.one('route', id).get({populate: false}).then(function (route) {
					route.number = $scope.otherRoutes.models[i].db.number;
					route.adjust_for = $scope.otherRoutes.models[i].db.adjust_for;
					route.save();
				});
			}

			$scope.relateOtherRoute = function(i) {
				$scope.otherRoutes.infowindow.close();
				Restangular.one($rootScope.model, $scope.id).post('routes', $scope.otherRoutes.models[i].db).then(function(newItem) {
					$scope.curRoutes.dirty=true;
					$scope.refreshModel();
				});
			}

			$scope.deleteOtherRoute = function(i) {
				$scope.otherRoutes.infowindow.close();
				$scope.otherRoutes.models[i].db.remove();
				$scope.otherRoutes.models[i].setMap(null);
			}

			$scope.updateCurInterestPoint = function(i) {
				$scope.curInterestPoints.infowindow.close();
				Restangular.one('interest_point', $scope.populateModel.interest_points[i].id).get({populate: ['loc']}).then(function (interestPoint) {
					interestPoint.loc.name = $scope.populateModel.interest_points[i].loc.name;
					interestPoint.save();
				});
			}

			$scope.unrelateCurInterestPoint = function(i) {
				$scope.curInterestPoints.infowindow.close();
				Restangular.one($rootScope.model, $scope.id).one('interest_points', $scope.populateModel.interest_points[i].id).remove().then(function(newItem) {
					$scope.curInterestPoints.dirty = true;
					$scope.refreshModel();
				});
			}

			$scope.updateOtherInterestPoint = function(id, i) {
				$scope.otherInterestPoints.infowindow.close();
				Restangular.one('interest_point', id).get({populate: ['loc']}).then(function (interestPoint) {
					interestPoint.loc.name = $scope.otherInterestPoints.models[i].locDb.name;
					interestPoint.save();
				});
			}

			$scope.relateOtherInterestPoint = function(i) {
				$scope.otherInterestPoints.infowindow.close();
				Restangular.one($rootScope.model, $scope.id).post('interest_points', $scope.otherInterestPoints.models[i].db).then(function(newItem) {
					$scope.curInterestPoints.dirty=true;
					$scope.refreshModel();
				});
			}

			$scope.deleteOtherInterestPoint = function(id, i) {
				$scope.otherInterestPoints.infowindow.close();
				Restangular.one('interest_point', id).get({populate: false}).then(function (interestPoint) {
					interestPoint.remove();
					$scope.otherInterestPoints.models[i].setMap(null);
				});
			}

			$scope.clearCross = function() {
				if($scope.drawingMarker && $scope.drawingMarker.getDrawingMode()) {
					$scope.drawingMarker.setDrawingMode(null);
				}
				if($scope.drawingPolyline && $scope.drawingPolyline.getDrawingMode()) {
					$scope.drawingPolyline.setDrawingMode(null);
				}
			}

		});
	});
