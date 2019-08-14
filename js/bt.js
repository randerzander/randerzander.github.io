// https://bandarra.me/2017/02/20/Fitness-Tracking-with-Web-Bluetooth/
// https://www.concept2.com/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf

var bluetoothDevice = null;

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
  const characteristics = {
    stroke1: 'ce060035-43e5-11e4-916c-0800200c9a66',
    stroke2: 'ce060036-43e5-11e4-916c-0800200c9a66'
  };

  console.log('Trying to connect..');

  bluetoothDevice.gatt.connect()
    .then(server => {
      console.log('server connected');
      server.getPrimaryService('ce060030-43e5-11e4-916c-0800200c9a66') // Rowing Service.
        .then(service => {
          console.log('got service');
          service.getCharacteristic(characteristics['stroke1'])
            .then(characteristic => characteristic.startNotifications())
            .then(characteristic => {
              console.log('Registering for stroke1');
              characteristic.addEventListener('characteristicvaluechanged', e => {
                handleStroke1(new Uint8Array(e.target.value.buffer));
              });
            });
          service.getCharacteristic(characteristics['stroke2'])
            .then(characteristic => characteristic.startNotifications())
            .then(characteristic => {
              console.log('Registering for stroke2');
              characteristic.addEventListener('characteristicvaluechanged', e => {
                handleStroke2(new Uint8Array(e.target.value.buffer));
              });
            });
        });
    });
}
