'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Buf = logicGate.Buf;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var Prove = require('../prove.js');


describe('Buf', function(){
  it('should be a transform stream', function(){
    var buffer = new Buf();
    expect(buffer).to.be.instanceof(stream.Transform);
  });

  it('should read as a true when piped an input high', function(done){
    var prove = new Prove(function(chunk) {
      expect(chunk).to.be.true;
      done();
    });

    var power = new Power();
    var high = new InputHigh(power);
    var buffer = new Buf();
    high.pipe(buffer).pipe(prove);

    power.turnOn();
  });

  it('should read as a false when piped an input low', function(done){
    var prove = new Prove(function(chunk) {
      expect(chunk).to.be.false;
      done();
    });

    var power = new Power();
    var low = new InputLow(power);
    var buffer = new Buf();
    low.pipe(buffer).pipe(prove);

    power.turnOn();
  });
});
