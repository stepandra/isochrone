window.onload = function() {
  Beam.init();
};
Beam = {
  STEP: 0.01,//variable that determines the step of beams
  INCREMENT: 0.01,//variable that incrementing step
  BEAMS_COUNT: 9,//count of Beams in isochrone map, that regulates number of polygon angles

  FILL_COLOR:'#a3e46b',//fill color of polygon
  STROKE_COLOR:'#6c6c6c',//stoke color of polygon
  API_URL:'http://maps.googleapis.com/maps/api/',//path to the google maps api library

  Beams: [],//array of beam end-points that creates a polygon
  deletePolygon: [],//array that deletes polygon from map
   //initialization function
  init: function() {
    var a = this;
    a.angleStep = 360 / a.BEAMS_COUNT;
    a.createMap();
    a.setHandlers();
  },
  //function that show map
  createMap: function() {
    var a = this;
    var e = document.getElementById('map');
    a.map = new google.maps.Map(e, {
      zoom: 12,
      center: new google.maps.LatLng(40.69847, -73.95144),
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  },

  setHandlers: function() {
    var a = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geocode = a.API_URL+'geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=false';
        $.getJSON('proxy.php?url=' + encodeURIComponent(geocode), function(response) {
          var formatted_address = response.contents.results[0].formatted_address;
          $('.address').val(formatted_address);
        });
      });
    }

    $('.show').click(function() {
      ga('send', 'event', 'show', 'all'); //google analytics integrtion

      a.time = $('.time').val() * 60;
      if (a.time > 360 && a.time <= 600) {
        a.STEP = a.INCREMENT = 0.005;
        a.convertAddress($('.address').val());
      } else if (a.time > 600 && a.time <= 1800) {
        a.STEP = a.INCREMENT = 0.01;
        a.convertAddress($('.address').val());
      } else if (a.time > 1800 && a.time <= 3600) {
        a.STEP = a.INCREMENT = 0.02;
        a.convertAddress($('.address').val());
      } else if (a.time > 3600 && a.time < 12000) {
        a.STEP = a.INCREMENT = 0.05;
        a.convertAddress($('.address').val());
      } else if (a.time < 2 || a.time>12000) {
        alert('Input time between 1 and 200 minutes');
      };
    });

  },
  //function that convert address to LatLng coordinates
  convertAddress: function(address) {
    //TODO: refactor start here.
    var a = this;
    a.clearMap();
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        a.map.setCenter(results[0].geometry.location);
        a.originX = results[0].geometry.location.lat();
        a.originY = results[0].geometry.location.lng();
        a.makeBeams(a.STEP, 0);
      }
    });
  },
  //determine and push end-points to the Beams array
  makeBeams: function(STEP, angle, lastX, lastY, minimize) {
    var a = this;
    if (minimize) {
      STEP = STEP / 2;
    } else {
      STEP = STEP + a.INCREMENT;
    }
    var x = a.originX + STEP * Math.cos(angle * Math.PI / 180);
    var y = a.originY + STEP * Math.sin(angle * Math.PI / 180);
    var url = a.API_URL+'distancematrix/json?origins=' + a.originX + ',' + a.originY + '&destinations=' + x + ',' + y + '&mode=' + $('.transport').val() + '&sensor=false';
    var uri = 'proxy.php?url=' + encodeURIComponent(url);
    setTimeout(function(uri, STEP, angle, x, y) {
      var request = new XMLHttpRequest();
      request.open('GET', uri, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var response = JSON.parse(request.responseText);
          if (response.contents.rows[0].elements[0].status == 'OK') {
            var time = response.contents.rows[0].elements[0].duration.value;
            if (a.time > time) {
              a.makeBeams(STEP, angle, x, y);
            } else if (lastX === undefined && lastY === undefined) {
              a.makeBeams(STEP, angle, undefined, undefined, true);
            } else {
              var beamX = lastX || a.originX;
              var beamY = lastY || a.originY;
              a.Beams.push(new google.maps.LatLng(beamX, beamY));
              if (a.Beams.length == a.BEAMS_COUNT) {
                a.makePolygon();
              } else {
                var newAngle = angle + a.angleStep;
                a.makeBeams(a.STEP, newAngle);
              }
            }
          } else {
            var beamX = lastX || a.originX;
            var beamY = lastY || a.originY;
            a.Beams.push(new google.maps.LatLng(beamX, beamY));
            if (a.Beams.length == a.BEAMS_COUNT) {
              a.makePolygon();
            } else {
              var newAngle = angle + a.angleSTEP;
              a.makeBeams(a.STEP, newAngle);
            }
          }
        } else {
          console.error('Error!');
          //Reached our target server, but it returned an error
        }
      };
      request.onerror = function() {
        // There was a connection error of some sort
        console.error('Error!');
      };
      request.send();
    }, 100, uri, STEP, angle, x, y, lastX, lastY);
  },
  //TODO: clear makePolygon function
  //draw polygon function
  makePolygon: function() {
    var a = this;
    var your_position = new google.maps.Marker({
      position: new google.maps.LatLng(a.originX, a.originY),
      map: a.map
    });
    var polygon = new google.maps.Polygon({
      paths: a.Beams,
      strokeColor: a.STROKE_COLOR,
      strokeOpacity: 0.8,
      strokwWeight: 2,
      fillColor: a.FILL_COLOR,
      fillOPacity: 0.2
    });
    polygon.setMap(a.map);
    a.deletePolygon.push(polygon);
  },
  //clear old polygon from the map
  clearMap: function() {
    var a = this; 
    for (var i = 0; i < a.deletePolygon.length; i++) {
      a.deletePolygon[i].setMap(null);
    }
    a.Beams=[];
    a.deletePolygon = [];
  }
};
