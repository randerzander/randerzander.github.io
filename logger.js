var points = [];

var x = document.getElementById("demo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
    setTimeout(getLocation, 10000);
}

function showPosition(position) {
    var now = new Date().toISOString();
    var newPoint = [now, position.coords.latitude, position.coords.longitude];

    if ((points == []) && (JSON.parse(localStorage['points']).constructor == Array))
      points = JSON.parse(localStorage['points']);

    points.push(newPoint);
    localStorage['points'] = JSON.stringify(points);

    x.innerHTML = now + ": lat: " + position.coords.latitude + 
    "<br>Long: " + position.coords.longitude; 
}

function printAll(){
    var all = document.getElementById("all");
    all.innerHTML = JSON.stringify(localStorage['points']);
}
