'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Not = logicGate.Not;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var createProve = require('../prove.js').createProve;


describe('Not', function(){
  it('should read as a false when piped an input high', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var high = power.pipe(new InputHigh());
    var not = new Not();
    high.pipe(not).pipe(prove);

    power.turnOn();
  });

  it('should read as a true when piped an input low', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var low = power.pipe(new InputLow());
    var not = new Not();
    low.pipe(not).pipe(prove);

    power.turnOn();
  });
});
