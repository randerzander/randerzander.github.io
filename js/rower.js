var data = {currentStroke: {}, stroke1: [], stroke2: [], strokes: [], raw1: [], raw2: []};
var strokeGauge;
var lol = 0;

var cnt = 0;

const MID_MUL = 256;
const HIGH_MUL = MID_MUL*256;

/*
var t0 = new Date();
Plotly.plot('strokes', [
  {x: [t0], y: [0], mode: 'lines', line: {color: 'green'}},
  {x: [t0], y: [0], mode: 'lines', line: {color: 'red'}},
  {x: [t0], y: [0], mode: 'lines', line: {color: 'yellow'}}
]);
*/

function drawGraph(){
  if (chart == null)
    strokeGauge = c3.generate({
      bindto: '#strokeGauge',
      data: {
        columns: [['data', 0]],
        type: 'gauge'
      },
      gauge: {},
      color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
        threshold: {
          values: [30, 60, 90, 100]
        }
      },
      size: {
        height: 180
      }
    });

  strokeGauge.load({
    columns: [['data', lol++]]
  });
}

function download(){
  res = data.strokes.map(x => x.join(','))
  uriContent = "data:application/octet-stream," + encodeURIComponent(res.join('\n'));
  window.open(uriContent, 'neuesDokument');
}

function handleStroke1(arr){
  //console.log('Stroke1: ' + arr);
  //37,2,0,92,0,0,68,118,32,1,179,2,170,0,98,0,34,2,2,0

  var stroke = {
    start : new Date(),

    //Distance Lo (0.1 m lsb), 3
    //Distance Mid, 4
    //Distance High, 5
    distance : (arr[3] + arr[4]*MID_MUL + arr[5]*HIGH_MUL) * .1,

    //Drive Length (0.01 meters, max = 2.55m), 6
    driveLength : arr[6],

    //Drive Time (0.01 sec, max = 2.55 sec), 7
    driveTime : .01*arr[7],

    //Stroke Recovery Time Lo (0.01 sec, max = 655.35sec) 8
    //Stroke Recovery Time Hi, 9
    recoveryTime : (arr[8] + arr[9]*MID_MUL)*.01,

    //Stroke Distance Lo (0.01 m, max=655.35m), 10
    //Stroke Distance Hi, 11
    strokeDistance : (arr[10] + arr[11]*MID_MUL)*.01,

    //Peak Drive Force Lo (0.1 lbs of force, max=6553.5m) 12
    //Peak Drive Force Hi, 13
    peakDriveForce : (arr[12] + arr[13]*MID_MUL)*.1,

    //Average Drive Force Lo (0.1 lbs of force,max=6553.5m) 14
    //Average Drive Force Hi, 15
    avgDriveForce : (arr[14] + arr[15]*MID_MUL)*.1,

    //Work Per Stroke Lo (0.1 Joules, max=6553.5 Joules), 16
    //Work Per Stroke Hi 17
    workPerStroke : (arr[16] + arr[17]*MID_MUL)*.1,

    //Stroke Count Lo, 18
    //Stroke Count Hi, 19
    strokeCount : arr[18] + arr[19]*MID_MUL
  };

  debugger;

  data.currentStroke = stroke;
  data.stroke1.push(stroke);
  data.raw1.push([new Date()].concat(arr));
  //Plotly.extendTraces('strokes', {x: [[stroke.start]], y: [[stroke.strokeCount]]}, [0]);
}

function handleStroke2(arr){
  //69,56,0,200,0,219,3,56,0,169,0,0,0,0,0
  //console.log('Stroke2: ' + arr);
  var stroke2 = {
    stop: new Date(),
    strokePower : arr[3] + arr[4]*MID_MUL,
    strokeCalories : arr[5] + arr[6]*MID_MUL,
    strokeCount : arr[7] + arr[8]*MID_MUL,
    projectedWorkTime : arr[9] + arr[10]*MID_MUL + arr[11]*HIGH_MUL,
    projectedWorkDistance : arr[12] + arr[13]*MID_MUL + arr[14]*HIGH_MUL
  };

  debugger;

  Object.keys(stroke2).map(x => {
    data.currentStroke[x] = stroke2[x];
  });
  data.stroke2.push(stroke2);
  data.strokes.push(data.currentStroke);
  data.raw2.push([new Date()].concat(arr));
  //Plotly.extendTraces('strokes', {x: [[stroke2.stop]], y: [[stroke2.strokeCount]]}, [1]);
}

