var bluetoothDevice = null;
var data = [];

function pair(){
  const options = {
    filters: [{services: ['ce060000-43e5-11e4-916c-0800200c9a66']}],
    optionalServices: [
      'ce060010-43e5-11e4-916c-0800200c9a66', // Information Service.
      'ce060020-43e5-11e4-916c-0800200c9a66', // Control Service.
      'ce060030-43e5-11e4-916c-0800200c9a66'  // Rowing Service.
    ]
  };

  navigator.bluetooth.requestDevice(options)
    .then(device => {
      console.log('got device');
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', disconnected);
      connect();
    })
}

function disconnected(){
  console.log('Disconnected!');
  connect();
}

function connect(){
  bluetoothDevice.gatt.connect()
    .then(server => {
      console.log('server connected');
      server.getPrimaryService('ce060030-43e5-11e4-916c-0800200c9a66') // Rowing Service.
        .then(service => {
          console.log('got service');
          service.getCharacteristic('ce060031-43e5-11e4-916c-0800200c9a66') // General Info.
            .then(characteristic => characteristic.startNotifications())
            .then(characteristic => {
              characteristic.addEventListener('characteristicvaluechanged', e => {
                data.push(toArray(e));
              });
            });
        });
    });
}

function toArray(e){
  var ret = [new Date().toISOString()];
  for (var i = 0; i < 19; i++)
    ret.push(e.target.value.getUint8(i));
  return ret;
}

function download(){
  res = data.map(x => x.join(','))
  uriContent = "data:application/octet-stream," + encodeURIComponent(res.join('\n'));
  window.open(uriContent, 'neuesDokument');
}
