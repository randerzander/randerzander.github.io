var position;
var marker;
var polyline;
var nextWaypoint;

function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      var now = new Date().toISOString();
      position = [pos.coords.latitude, pos.coords.longitude];
      var point = [now, pos.coords.latitude, pos.coords.longitude];

      map.setView([position[0], position[1]], 18);
      if (points.length == 0)
        nextWaypoint = route[0];
      else if (distance(position, nextWaypoint) < .001)
        nextWaypoint = route[calcNextWaypoint(position)];

      points.push(point);

      var latLng = new L.LatLng(position[0], position[1]);
      if (marker == null)
        marker = L.marker([position[0], position[1]]).addTo(map);
      marker.setLatLng(latLng);

      //setText('distanceTraveled', distance(points[0], nextWaypoint));

    });
    setTimeout(getLocation, 10000);
}

//parse GPX into route points
function parseRoute(text){
  route = text.split('<trkpt lat="').slice(1).map(point => {
    return [point.split('"')[0], point.split('lon="')[1].split('"')[0]]
  });
}

function calcNextWaypoint(position){
  minDist = distance(position, route[0]);
  next = route[0];
  var i;
  for (i = 0; i < route.length; i++){
    if (distance(position, x) < minDist){
      next = x;
      break;
    }
  }
  return i;
}

function distance(pos1, pos2){
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(pos2[0] - pos1[0]);  // deg2rad below
  var dLon = deg2rad(pos2[1] - pos1[1]); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(pos1[0])) * Math.cos(deg2rad(pos2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  //return in miles
  return d*0.62137;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
