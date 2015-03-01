'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var TimeSeriesInput = logicGate.TimeSeriesInput;
var HazardFilter = logicGate.HazardFilter;
var Prove = require('../prove.js');
var createSequentialProve = Prove.createSequentialProve;


describe('HazardFilter', function(){
  it('should pick chunks at intervals at 1 step', function(done){
    var power = new Power();
    var clock = new Clock(4, power);
    var inputs = new TimeSeriesInput(function(time) {
        return time % 2 > 0; // Create [ false, true, false, true ]
    });

    power.pipe(clock)
      .pipe(inputs)
      .pipe(new HazardFilter(1))
      .pipe(createSequentialProve([ false, false ], done));

    power.turnOn();
  });

  it('should pick chunks at intervals at 0 step', function(done){
    var power = new Power();
    var clock = new Clock(4, power);
    var inputs = new TimeSeriesInput(function() {
        return true; // Create [ true, true, true, true ]
    });

    power.pipe(clock)
      .pipe(inputs)
      .pipe(new HazardFilter(0))
      .pipe(createSequentialProve([ true, true, true, true], done));

    power.turnOn();
  });
});
