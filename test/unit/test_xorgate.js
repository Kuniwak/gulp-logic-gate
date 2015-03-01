'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Xor = logicGate.Xor;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var Prove = require('../prove.js');


describe('Xor', function(){
  function createProve(expectedValue, done) {
    return new Prove(function(chunk) {
      expect(chunk).to.equal(expectedValue);
      done();
    });
  }

  it('should be a transform stream', function(){
    var or = new Xor();
    expect(or).to.be.instanceof(stream.Transform);
  });


  it('should read as a true when piped a low input', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low = new InputLow(power);

    var or = new Xor();
    low.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a true when piped several low inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var low1 = new InputLow(power);
    var low2 = new InputLow(power);
    var low3 = new InputLow(power);

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
    var high = new InputHigh(power);

    var or = new Xor();
    high.pipe(or).pipe(prove);

    power.turnOn();
  });


  it('should read as a false when piped even high inputs', function(done){
    var prove = createProve(false, done);

    var power = new Power();
    var high1 = new InputHigh(power);
    var high2 = new InputHigh(power);

    var or = new Xor();
    high1.pipe(or);
    high2.pipe(or);

    or.pipe(prove);

    power.turnOn();
  });
});
