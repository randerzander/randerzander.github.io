var points = [];
var map;
var route = [];

var app = new Vue({
  el: '#app',
  data: {
    showSetup: true,
    showMap: false,
    showRow: true,
    showRun: false,
    showRoutePicker: false,
    showDownload: false,
    data: data
  }
});

function calcMapHeight(id, margin){
  $('#'+id).css("height", ($(window).height() - margin));
  $(window).on("resize", resize);
  resize();
  function resize(){

      if($(window).width()>=980){
          $('#'+id).css("height", ($(window).height() - margin));
          $('#'+id).css("margin-top",50);
      }else{
          $('#'+id).css("height", ($(window).height() - (margin+12)));
          $('#'+id).css("margin-top",-21);
      }

  }
}

function routeRun(){
  app.showSetup=false;
  app.showRoutePicker=true;
}

function start(){
  var free = (document.getElementById('routes') == null);

  app.showRun = true;
  app.showMap = true;
  app.showDownload = true;
  app.showSetup = false;
  app.showRow = false;
  app.showRoutes = false;

  //Setup map
  calcMapHeight('mapDiv', 100);
  map = L.map('mapDiv');
  var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});   

  if (!free) polyline = L.polyline(route).addTo(map);
  osm.addTo(map);

  //Start logging location
  getLocation();
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
  };
  reader.readAsText(el.files[0]);
}
