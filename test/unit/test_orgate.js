'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Or = logicGate.Or;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var Prove = require('../prove.js');


describe('Or', function(){
  function createProve(expectedValue, done) {
    return new Prove(function(chunk) {
      expect(chunk).to.equal(expectedValue);
      done();
    });
  }

  it('should be a transform stream', function(){
    var or = new Or();
    expect(or).to.be.instanceof(stream.Transform);
  });

  it('should read as a true when piped a high input', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high = new InputHigh(power);

    var or = new Or();
    high.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped several high inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low1 = new InputLow(power);
    var low2 = new InputLow(power);
    var low3 = new InputLow(power);

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
    var low = new InputLow(power);

    var or = new Or();
    low.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped several high inputs and several low inputs', function(done){
    var prove = createProve(true, done);

    var power = new Power();
    var high = new InputHigh(power);
    var low = new InputLow(power);

    var or = new Or();
    high.pipe(or);
    low.pipe(or);

    or.pipe(prove);

    power.turnOn();
  });


  it('should read as a false when both low and high inputs are piped and the high input are only unpiped', function(done){


    var power = new Power();
    var high = new InputHigh(power);
    var low = new InputLow(power);

    var or = new Or();
    high.pipe(or);
    high.unpipe(or);
    low.pipe(or);

    var prove = createProve(false, done);
    or.pipe(prove);

    power.turnOn();
  });
});
