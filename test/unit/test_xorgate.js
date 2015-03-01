'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Xor = logicGate.Xor;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var createProve = require('../prove.js').createProve;


describe('Xor', function(){
  it('should read as a true when piped a low input', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low = power.pipe(new InputLow());

    var or = new Xor();
    low.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped several low inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low1 = power.pipe(new InputLow());
    var low2 = power.pipe(new InputLow());
    var low3 = power.pipe(new InputLow());

    var or = new Xor();
    low1.pipe(or);
    low2.pipe(or);
    low3.pipe(or);

    or.pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped odd high inputs', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high = power.pipe(new InputHigh());

    var or = new Xor();
    high.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped even high inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var high1 = power.pipe(new InputHigh());
    var high2 = power.pipe(new InputHigh());

    var or = new Xor();
    high1.pipe(or);
    high2.pipe(or);

    or.pipe(prove);

    power.turnOn();
  });
});
