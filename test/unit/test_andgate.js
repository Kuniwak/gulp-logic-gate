'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var And = logicGate.And;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var createProve = require('../prove.js').createProve;


describe('And', function(){
  it('should read as a true when piped a high input', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high = power.pipe(new InputHigh());

    var and = new And();
    high.pipe(and).pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped several high inputs', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high1 = power.pipe(new InputHigh());
    var high2 = power.pipe(new InputHigh());
    var high3 = power.pipe(new InputHigh());

    var and = new And();
    high1.pipe(and);
    high2.pipe(and);
    high3.pipe(and);

    and.pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped a low input', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low = power.pipe(new InputLow());

    var and = new And();
    low.pipe(and).pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped several high inputs and several low inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var high1 = power.pipe(new InputHigh());
    var high2 = power.pipe(new InputHigh());
    var low = power.pipe(new InputLow());

    var and = new And();
    high1.pipe(and);
    high2.pipe(and);
    low.pipe(and);

    and.pipe(prove);

    power.turnOn();
  });


  it('should read as a true when both low and high inputs are piped and the low input are only unpiped', function(done){


    var power = new Power();
    var high = power.pipe(new InputHigh());
    var low = power.pipe(new InputLow());

    var and = new And();
    high.pipe(and);
    low.pipe(and);
    low.unpipe(and);

    var prove = createProve(true, done);
    and.pipe(prove);

    power.turnOn();
  });
});
