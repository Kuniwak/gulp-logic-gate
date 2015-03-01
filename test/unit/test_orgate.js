'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Or = logicGate.Or;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var createProve = require('../prove.js').createProve;


describe('Or', function(){
  it('should read as a true when piped a high input', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high = power.pipe(new InputHigh());

    var or = new Or();
    high.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped several high inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low1 = power.pipe(new InputLow());
    var low2 = power.pipe(new InputLow());
    var low3 = power.pipe(new InputLow());

    var or = new Or();
    low1.pipe(or);
    low2.pipe(or);
    low3.pipe(or);

    or.pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped a low input', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low = power.pipe(new InputLow());

    var or = new Or();
    low.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped several high inputs and several low inputs', function(done){
    var power = new Power();
    var high = power.pipe(new InputHigh());
    var low = power.pipe(new InputLow());

    var or = new Or();
    high.pipe(or);
    low.pipe(or);

    var prove = createProve(true, done);
    or.pipe(prove);

    power.turnOn();
  });


  it('should read as a false when both low and high inputs are piped and the high input are only unpiped', function(done){
    var power = new Power();
    var high = power.pipe(new InputHigh());
    var low = power.pipe(new InputLow());

    var or = new Or();
    high.pipe(or);
    high.unpipe(or);
    low.pipe(or);

    var prove = createProve(false, done);
    or.pipe(prove);

    power.turnOn();
  });
});
