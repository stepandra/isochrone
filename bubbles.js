var cityCircle;
window.onload = function () {

	Beam.init();

};

Beam = {

	step : 0.01,

	increment : 0.01,

	beamsCount : 3,

	minDistance : 0,
	maxDistance:0,

	Distance : 0,

	arr1 : [],

	darr : [],

	drawLeftTopCorner : [],

	Beams : [],
	arr2:[],
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
var proxy = 'proxy.php',
      urie = proxy + '?url=' + encodeURIComponent(geocode);
		
$.getJSON(urie,function(response200){



						var new2 = response200.contents.results[0].formatted_address;
   
						$('.address').val(new2);

});


          });
      }

		$('.show').click(function () {
ga('send', 'event', 'show', 'all');
			//NProgress.start();

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
      //     .
      
       else if(a.time<2) {
        alert("Input real time");
      }
		    else if(a.time>12000) {
        alert("Input time beetween 1 and 200 minutes");
      }


		});

	},

	convertAddress : function (address) {

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

		if (minimize)

			step = step / 2;

		else

			step = step + a.increment;

		var x = a.originX + step * Math.cos(angle * Math.PI / 180);

		var y = a.originY + step * Math.sin(angle * Math.PI / 180);

		var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + a.originX + ',' + a.originY + '&destinations=' + x + ',' + y + '&mode='+$('.transport').val()+'&sensor=false';
		
		 var proxy = 'proxy.php',
      uri = proxy + '?url=' + encodeURIComponent(url);
		setTimeout(function (uri, step, angle, x, y) {

			$.getJSON(uri, function (response,status) {
console.log(uri);
console.log(response.contents.status);
				if (response.contents.rows[0].elements[0].status == 'OK') {

					var time = response.contents.rows[0].elements[0].duration.value;

					a.Distance = response.contents.rows[0].elements[0].distance.value || a.Distance;

					if (a.time > time) {
						NProgress.start();

						a.makeBeams(step, angle, x, y);

					} else if (lastX == undefined && lastY == undefined) {

						a.makeBeams(step, angle, undefined, undefined, true);

					} else {

						var beamX = lastX || a.originX;

						var beamY = lastY || a.originY;

						a.Beams.push(new google.maps.LatLng(beamX, beamY));

						if (angle == 0) {

							a.minDistance = a.Distance;
							a.maxDistance = a.Distance;

						} else {

							a.minDistance = (a.Distance < a.minDistance) ? a.Distance : a.minDistance;
							a.maxDistance = (a.Distance > a.maxDistance) ? a.Distance : a.maxDistance;

						}

						if (a.Beams.length == a.beamsCount) {
NProgress.done(),
							a.makePoint(0, 0)

						} else {

							var newAngle = angle + a.angleStep;

							a.makeBeams(a.step, newAngle);

						}

					}

				} else {

					var beamX = lastX || a.originX;

					var beamY = lastY || a.originY;

					a.Beams.push(new google.maps.LatLng(beamX, beamY));

					if (angle == 0) {

						a.minDistance = a.Distance;
						a.maxDistance = a.Distance;

					} else {

						a.minDistance = (a.Distance < a.minDistance) ? a.Distance : a.minDistance;
						a.maxDistance = (a.Distance > a.maxDistance) ? a.Distance : a.maxDistance;

					}

					if (a.Beams.length == a.beamsCount)

						a.makePoint(0, 0);

					else {

						var newAngle = angle + a.angleStep;

						a.makeBeams(a.step, newAngle);

					}

				}

			});

		}, 300, uri, step, angle, x, y, lastX, lastY);



	},

	makePoint : function (i, j) {

		var a = this;



		a1 = a.minDistance;

		var lat1 = a.originX + a.convertLat(a1);

		var lng = a.originY - a.convertLat(a1);

		x = lat1 - (j - 1) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		y = lng + (i - 1) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x1 = lat1 - (j) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y1 = lng + (i) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x2 = lat1 - (j + 1) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y2 = lng + (i + 1) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x3 = lat1 - (j + 2) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y3 = lng + (i + 2) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x4 = lat1 - (j + 3) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y4 = lng + (i + 3) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x5 = lat1 - (j + 4) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y5 = lng + (i + 4) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x6 = lat1 - (j + 5) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y6 = lng + (i + 5) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x7 = lat1 - (j + 6) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y7 = lng + (i + 6) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		var x8 = lat1 - (j + 7) * (2 * a.convertLat(a1) / 10) - a.convertLat(a1) / 10;

		var y8 = lng + (i + 7) * (2 * a.convertLat(a1) / 10) + a.convertLat(a1) / 10;

		

		var url1 = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+ a.originX + ',' + a.originY + "&destinations=" + x + ',' + y + "|" + x1 + ',' + y1 + '|' + x2 + ',' + y2 + '|' + x3 + ',' + y3 + '|' + x4 + ',' + y4 + '|' + x5 + ',' + y5 + '|'+ x6 + ',' + y6 + '|' + x7 + ',' + y7 + '|' + x8 + ',' + y8 + "&mode='+$('.transport').val()+'&sensor=false";
var proxy = 'proxy.php',
      uri = proxy + '?url=' + encodeURIComponent(url1);
		var geocodUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x + "," + y + "&sensor=false";
var uri1=proxy + '?url=' + encodeURIComponent(geocodUrl);
		var geocodUrl1 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x1 + "," + y1 + "&sensor=false";
var uri2=proxy + '?url=' + encodeURIComponent(geocodUrl1);
		var geocodUrl2 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x2 + "," + y2 + "&sensor=false";
var uri3=proxy + '?url=' + encodeURIComponent(geocodUrl2);
		var geocodUrl3= "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x3 + "," + y3 + "&sensor=false";
var uri4=proxy + '?url=' + encodeURIComponent(geocodUrl3);
		var geocodUrl4 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x4 + "," + y4 + "&sensor=false";
var uri5=proxy + '?url=' + encodeURIComponent(geocodUrl4);
		var geocodUrl5 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x5 + "," + y5 + "&sensor=false";var geocodUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x + "," + y + "&sensor=false";
var uri6=proxy + '?url=' + encodeURIComponent(geocodUrl5);
		var geocodUrl6 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x6 + "," + y6 + "&sensor=false";
var uri7=proxy + '?url=' + encodeURIComponent(geocodUrl6);
		var geocodUrl7 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x7 + "," + y7 + "&sensor=false";
var uri8=proxy + '?url=' + encodeURIComponent(geocodUrl7);
var geocodUrl8 = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + x8 + "," + y8 + "&sensor=false";
var uri9=proxy + '?url=' + encodeURIComponent(geocodUrl8);
		

		setTimeout(function (uri, i, j,geocodUrl1,geocodUrl2,geocodUrl8,geocodUrl7,geocodUrl6,geocodUrl5,geocodUrl3,geocodUrl4,geocodUrl) {

			NProgress.set(0.25*i); 

			$.getJSON(uri, function (response) {

				$.getJSON(uri1,function(response1){

				if (response.contents.rows[0].elements[0].status == 'OK' ) {

					var time1 = response.contents.rows[0].elements[0].duration.value-200;

					

					if (a.time > time1) {

						var newAddress = response1.contents.results[0].geometry.location.lat;

						var newAddress1 = response1.contents.results[0].geometry.location.lng;

						a.arr1.push(new google.maps.LatLng(newAddress, newAddress1));
a.arr2.push(true);
						



					}

}

});

				$.getJSON(uri2,function(response2){

if (response.contents.rows[0].elements[1].status=='OK'){

var time2 = response.contents.rows[0].elements[1].duration.value;

					if (a.time > time2) {



						var newAddress2 = response2.contents.results[0].geometry.location.lat;

						var newAddress3 = response2.contents.results[0].geometry.location.lng;

						a.arr1.push(new google.maps.LatLng(newAddress2, newAddress3));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri3,function(response3){

if (response.contents.rows[0].elements[2].status=='OK'){

var time3 = response.contents.rows[0].elements[2].duration.value;

					if (a.time > time3) {



						var newAddress4 = response3.contents.results[0].geometry.location.lat;

						var newAddress5 = response3.contents.results[0].geometry.location.lng;

						a.arr1.push(new google.maps.LatLng(newAddress4, newAddress5));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri4,function(response4){

if (response.contents.rows[0].elements[3].status=='OK'){

var time4 = response.contents.rows[0].elements[3].duration.value;

var newAddress6 = response4.contents.results[0].geometry.location.lat;

						var newAddress7 = response4.contents.results[0].geometry.location.lng;

					if (a.time > time4) {

						a.arr1.push(new google.maps.LatLng(newAddress6, newAddress7));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri5,function(response5){

if (response.contents.rows[0].elements[4].status=='OK'){

var time5 = response.contents.rows[0].elements[4].duration.value;

var newAddress8 = response5.contents.results[0].geometry.location.lat;

						var newAddress9 = response5.contents.results[0].geometry.location.lng;

					if (a.time > time5) {

						a.arr1.push(new google.maps.LatLng(newAddress8, newAddress9));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri6,function(response6){

if (response.contents.rows[0].elements[5].status=='OK'){

var time6 = response.contents.rows[0].elements[5].duration.value;

var newAddress10 = response6.contents.results[0].geometry.location.lat;

						var newAddress11 = response6.contents.results[0].geometry.location.lng;

					if (a.time > time6) {

						a.arr1.push(new google.maps.LatLng(newAddress10, newAddress11));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri7,function(response7){

if (response.contents.rows[0].elements[6].status=='OK'){

var time7 = response.contents.rows[0].elements[6].duration.value;

var newAddress12 = response7.contents.results[0].geometry.location.lat;

						var newAddress13 = response7.contents.results[0].geometry.location.lng;

					if (a.time > time7) {

						a.arr1.push(new google.maps.LatLng(newAddress12, newAddress13));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri8,function(response8){

if (response.contents.rows[0].elements[7].status=='OK'){

	var newAddress14 = response8.contents.results[0].geometry.location.lat;

						var newAddress15 = response8.contents.results[0].geometry.location.lng;

var time8 = response.contents.rows[0].elements[7].duration.value;

					if (a.time > time8) {

						a.arr1.push(new google.maps.LatLng(newAddress14, newAddress15));
a.arr2.push(true);
						

					}

}

});

				$.getJSON(uri9,function(response9){

if (response.contents.rows[0].elements[8].status=='OK'){

	var newAddress16 = response9.contents.results[0].geometry.location.lat;

						var newAddress17 = response9.contents.results[0].geometry.location.lng;

var time9 = response.contents.rows[0].elements[8].duration.value;

					if (a.time > time9) {

						a.arr1.push(new google.maps.LatLng(newAddress16, newAddress17));
a.arr2.push(true);
						

					}

				}

});					

					


					

					if (j < 2) {

						a.makePoint(i, j + 1);

					} else if (i < 5) {

						a.makePoint(i + 1, 0);

					}
					else if(i=4) {
a.makePolygon();

					}

				if (response.contents.rows[0].elements[0].status != 'OK') {

					if (j < 2) {

						a.makePoint(i, j + 1);

					} else if (i < 5) {

						a.makePoint(i + 1, 0);

					}

				}

			});



		}, 200, uri, i, j,geocodUrl1,geocodUrl2,geocodUrl8,geocodUrl7,geocodUrl6,geocodUrl5,geocodUrl3,geocodUrl4,geocodUrl);
 

	},

	makePolygon : function (x, y) {



		var a = this;

	
var image7 = new google.maps.MarkerImage(
  'http://isochrone.com.ua/pin.png',
  new google.maps.Size(30,48),
  new google.maps.Point(0,0),
  new google.maps.Point(24,48)
);
var mark1 = new google.maps.Marker({
        position: new google.maps.LatLng(a.originX,a.originY),
	icon:image7,
        map: a.map,
        
    });

		a.arr1.sort();
for (var i = a.arr1.length - 1; i > 0; i--) {
    if (a.arr1[i] == a.arr1[i - 1]) a.arr1.splice( i, 1);
}
console.log(a.arr1);

		
		var radius;
		console.log(a.minDistance);
if(a.time>=10){
		  
		radius=a.minDistance-300;  
	  }
	  else if(a.time>10 && a.time<=20){
		  radius=a.minDistance-600;
	  }
		  else if(a.time>20){
			radius=a.minDistance-1000;  
		  }
		  if($('select').val()!='OK'){
var place='https://maps.googleapis.com/maps/api/place/search/json?location=' + a.originX + ',' + a.originY + '&radius='+radius+'&types='+$('select').val()+'&sensor=false&key=AIzaSyBGwbLDLZ8baDu_FbeMIftP9m1c-EkOi2o';
     var proxy = 'proxy.php',
      uri = proxy + '?url=' + encodeURIComponent(place);
    $.getJSON(uri, function(response) {

for(var i=0;i<response.contents.results.length;i++){

   var mark = new google.maps.Marker({
        position: response.contents.results[i].geometry.location,
        map: a.map,
        title: response.contents.results[i].name
    });
   
}
    });
}
else{
for(var i=0;i<a.arr1.length;i++){
		var populationOptions = {

			strokeColor : '#ADFF2F',

			strokeOpacity : 0,

			strokeWeight : 0,

			fillColor : '#ADFF2F',

			fillOpacity : 0.3,

			map : a.map,

			center : a.arr1[i],

			radius : a.minDistance / 10

		};
	console.log(a.arr1[i].ob);

		cityCircle = new google.maps.Circle(populationOptions);
		a.okruj.push(cityCircle);
}
		
}
	},


	convertLat : function (lat) {

		var b = lat / 111000.111;

		return b;

	},

	convertLng : function (lat) {

		var c = 6371 * (Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 1000;

		return lat / c;

	},

clearMap: function() {
    var a = this;
    for (var i = 0; i < a.okruj.length; i++ ) {
    a.okruj[i].setMap(null);
  }
  a.okruj = [];
  
  },

	leftTopCorner : function (x, y) {

		var a = this;

		var polygon;

		var x1 = x + a.convertLat(a.minDistance / 20);

		var y1 = y + a.convertLat(a.minDistance / 20);

		var xarr = [];

		var yarr = [];

		var drawLeftTopCorner = [];

		var n;

		var g = a.convertLat(a.minDistance / 20);

		n = 36;
if(a.arr2[i]==true){


}
		for (var i = 0; i < n; i++) {

			var a = i * Math.PI / 2 / n;

			xarr[i] = x1 + g * (1 - Math.cos(a))

				yarr[i] = y1 + g * (1 - Math.sin(a))

				drawLeftTopCorner.push(new google.maps.LatLng(xarr[i], yarr[i]));

		}

		drawLeftTopCorner.push(new google.maps.LatLng(x1, y1));

		console.log(drawLeftTopCorner);

		polygon = new google.maps.Polygon({

				paths : drawLeftTopCorner,

				strokeColor : '#FF0000',

				strokeOpacity : 0.8,

				strokeWeight : 2,

				fillColor : '#FF0000',

				fillOpacity : 0.35

			});

		polygon.setMap(a.map);

	}

}