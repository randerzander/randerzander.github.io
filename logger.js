var points = [];
var map;
var route = [];

function start(free){
  //Setup map
  map = L.map('mapid');
  var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});   
  if (!free) polyline = L.polyline(route).addTo(map);
  osm.addTo(map);

  //Start logging location
  getLocation();
  show("routes", false);
  show("free", false);
  show("start", false);
  show("download", true);
}

//Save as CSV
function download(){
  res = points.map(x => x.join(','))
  uriContent = "data:application/octet-stream," + encodeURIComponent(res.join('\n'));
  window.open(uriContent, 'neuesDokument');
}

//File upload to local var
function loadRoute(el){
  var reader = new FileReader();
  reader.onload = function(el) {
    console.log('Loaded file');
    parseRoute(el.target.result);
    document.getElementById("start").hidden = false;
  };
  reader.readAsText(el.files[0]);
}

function setText(id, text){
  document.getElementById(id).innerHtml = text;
}

function show(id, visible){
  var el = document.getElementById(id);
  if (visible) el.style.display = "block";
  else el.style.display = "none";
}
