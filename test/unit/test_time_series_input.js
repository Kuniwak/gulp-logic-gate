'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var TimeSeriesInput = logicGate.TimeSeriesInput;
var createSequentialProve = require('../prove.js').createSequentialProve;


describe('TimeSeriesInput', function(){
  it('should be read as a time series LH when given 1 as the life times', function(done){
    var power = new Power();
    var clock = new Clock(2, power);
    power.pipe(clock);

    var inputs = new TimeSeriesInput(function(time) {
      return time % 2 === 1;
    });
    clock.pipe(inputs);

    var prove = createSequentialProve([false, true], done);
    inputs.pipe(prove);

    power.turnOn();
  });
});
