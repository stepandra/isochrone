window.onload = function () {

	Beam.init();

};

Beam = {
	step : 0.01,
	increment : 0.01,
	beamsCount : 6,
	minDistance : 0,
	maxDistance:0,
	Distance : 0,
	Beams : [],
	okruj:[],

	init : function () {

		var a = this;
		a.angleStep = 360 / a.beamsCount;
		a.createMap();
		a.setHandlers();

	},

	createMap : function () {

		var a = this;
		var e = document.getElementById("map");
		a.map = new google.maps.Map(e, {
				zoom : 14,
				center : new google.maps.LatLng(48.457489,35.056011),
				disableDefaultUI: true,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});

	},

	setHandlers : function () {

		var a = this;
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {

				var geocode = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=false";
				$.getJSON('proxy.php?url=' + encodeURIComponent(geocode),function(response){

						var formatted_address = response.contents.results[0].formatted_address;
						$('.address').val(formatted_address);

						});
          });
      }

		$('.show').click(function () {
			ga('send', 'event', 'show', 'all');//google analytics integrtion

			a.time = $('.time').val() * 60;
			if(a.time > 360 && a.time <= 600){

				a.step = a.increment = 0.005;
				a.convertAddress($('.address').val());

				}
				else if(a.time > 600 && a.time <= 1800) {

					a.step = a.increment = 0.01;
					a.convertAddress($('.address').val());

				}
				else if(a.time > 1800 && a.time <= 3600){

					a.step = a.increment = 0.02;
					a.convertAddress($('.address').val());

				}
				else if(a.time > 3600 && a.time<12000){

					a.step = a.increment = 0.05;
					a.convertAddress($('.address').val());

				}
				else if(a.time<2) {

					alert("Input real time");

				}
				else if(a.time>12000) {

					alert("Input time beetween 1 and 200 minutes");

				}

		});

	},

	convertAddress : function (address) {
		//TODO: refactor start here.
		var a = this;
		a.Beams = [];
		a.clearMap();
		geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'address' : address
		}, function (results, status) {

			if (status == google.maps.GeocoderStatus.OK) {

				a.map.setCenter(results[0].geometry.location);
				a.originX = results[0].geometry.location.lat();
				a.originY = results[0].geometry.location.lng();
				a.makeBeams(a.step, 0);

			}

		});

	},

	makeBeams : function (step, angle, lastX, lastY, minimize) {

		var a = this;
		if (minimize){

			step = step / 2;

			}
			else{

				step = step + a.increment;

			}
		var x = a.originX + step * Math.cos(angle * Math.PI / 180);
		var y = a.originY + step * Math.sin(angle * Math.PI / 180);
		var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + a.originX + ',' + a.originY + '&destinations=' + x + ',' + y + '&mode='+$('.transport').val()+'&sensor=false';
		var uri = 'proxy.php?url=' + encodeURIComponent(url);
		console.log("makeBeams_status: start");
		setTimeout(function (uri, step, angle, x, y) {

			var request = new XMLHttpRequest();
			request.open('GET', uri, true);
			request.onload = function() {

				if (request.status >= 200 && request.status < 400) {
					// Success!
					var response = JSON.parse(request.responseText);
					console.log(response.contents.status);

					if (response.contents.rows[0].elements[0].status == 'OK') {

						var time = response.contents.rows[0].elements[0].duration.value;
						a.Distance = response.contents.rows[0].elements[0].distance.value || a.Distance;

						if (a.time > time) {

							a.makeBeams(step, angle, x, y);

						} else if (lastX === undefined && lastY === undefined) {

							a.makeBeams(step, angle, undefined, undefined, true);

						} else {

							var beamX = lastX || a.originX;

							var beamY = lastY || a.originY;

							a.Beams.push(new google.maps.LatLng(beamX, beamY));

							if (angle === 0) {

								a.minDistance = a.Distance;
								a.maxDistance = a.Distance;

							} else {

								a.minDistance = (a.Distance < a.minDistance) ? a.Distance : a.minDistance;
								a.maxDistance = (a.Distance > a.maxDistance) ? a.Distance : a.maxDistance;

							}

							if (a.Beams.length == a.beamsCount) {

								console.log("makeBeams_status: ready");
								a.makePolygon();

							} else {

								var newAngle = angle + a.angleStep;
								a.makeBeams(a.step, newAngle);

							}

						}

					} else {

						var beamX = lastX || a.originX;
						var beamY = lastY || a.originY;

						a.Beams.push(new google.maps.LatLng(beamX, beamY));

						if (angle === 0) {

							a.minDistance = a.Distance;
							a.maxDistance = a.Distance;

						} else {

							a.minDistance = (a.Distance < a.minDistance) ? a.Distance : a.minDistance;
							a.maxDistance = (a.Distance > a.maxDistance) ? a.Distance : a.maxDistance;

						}

						if (a.Beams.length == a.beamsCount){
						//TODO: rename variables
						a.makePolygon();

					}
						else {

							var newAngle = angle + a.angleStep;
							a.makeBeams(a.step, newAngle);

						}

					}

				} else {

					console.error("Error!");
					// We reached our target server, but it returned an error
				}
			};
			request.onerror = function() {
				// There was a connection error of some sort
				console.error("Error!");

			};
			request.send();
			//TODO:Delte DEBUG code
		}, 100, uri, step, angle, x, y, lastX, lastY);
	},
	//TODO: clear makePolygon function
	makePolygon : function () {

		var a = this;
		var image = new google.maps.MarkerImage(
			'http://isochrone.com.ua/pin.png',
			new google.maps.Size(30,48),
			new google.maps.Point(0,0),
			new google.maps.Point(24,48)
		);
		var your_position = new google.maps.Marker({
			position: new google.maps.LatLng(a.originX,a.originY),
			icon:image,
			map: a.map,
		});
		var polygon= new google.maps.Polygon({
			paths:a.Beams,
			strokeColor:"#6c6c6c",
			strokeOpacity:0.8,
			strokwWeight:2,
			fillColor:"#a3e46b",
			fillOPacity:0.2
		});
		polygon.setMap(a.map);

	},
clearMap: function() {

		var a = this;
		for (var i = 0; i < a.okruj.length; i++ ) {

			a.okruj[i].setMap(null);

		}
		a.okruj = [];
	}
};
