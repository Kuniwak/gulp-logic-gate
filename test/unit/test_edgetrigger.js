'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var TimeSeriesInput = logicGate.TimeSeriesInput;
var EdgeTrigger = logicGate.EdgeTrigger;
var createSequentialProve = require('../prove.js').createSequentialProve;


describe('EdgeTrigger', function(){
  it('should be read as a time series HL when HL arrived', function(done){
    var power = new Power();
    var clock = new Clock(2, power);
    power.pipe(clock);

    var inputs = new TimeSeriesInput(function(time) {
      return time % 2 === 0; // Create [ true, false ]
    });
    clock.pipe(inputs);

    var prove = createSequentialProve([ true, false ], done);
    inputs.pipe(new EdgeTrigger()).pipe(prove);

    power.turnOn();
  });

  it('should be read as a time series LH when LH arrived', function(done){
    var power = new Power();
    var clock = new Clock(2, power);
    power.pipe(clock);

    var inputs = new TimeSeriesInput(function(time) {
      return time % 2 === 1; // Create [ false, true ]
    });
    clock.pipe(inputs);

    var prove = createSequentialProve([ false, true ], done);
    inputs.pipe(new EdgeTrigger()).pipe(prove);

    power.turnOn();
  });


  it('should be read as a time series LHLH when LLHHLLHH arrived', function(done){
    var power = new Power();
    var clock = new Clock(8, power);
    power.pipe(clock);

    var inputs = new TimeSeriesInput(function(time) {
      return time % 4 > 1; // Create [ false, false, true, true, false, false, true, true  ]
    });
    clock.pipe(inputs);

    var prove = createSequentialProve([ false, true, false, true ], done);
    inputs.pipe(new EdgeTrigger()).pipe(prove);

    power.turnOn();
  });
});
