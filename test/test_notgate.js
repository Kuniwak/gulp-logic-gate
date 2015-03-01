'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../index.js');
var Power = logicGate.Power;
var Not = logicGate.Not;
var InputHigh = logicGate.InputHigh;
var InputLow = logicGate.InputLow;

var Prove = require('./prove.js');


describe('Not', function(){
  it('should be a transform stream', function(){
    var not = new Not();
    expect(not).to.be.instanceof(stream.Transform);
  });

  it('should read as a true when piped an input high', function(done){
    var prove = new Prove(function(chunk) {
      expect(chunk).to.be.false;
      done();
    });

    var power = new Power();
    var high = new InputHigh(power);
    var not = new Not();
    high.pipe(not).pipe(prove);

    power.turnOn();
  });

  it('should read as a true when piped an input low', function(done){
    var prove = new Prove(function(chunk) {
      expect(chunk).to.be.true;
      done();
    });

    var power = new Power();
    var low = new InputLow(power);
    var not = new Not();
    low.pipe(not).pipe(prove);

    power.turnOn();
  });
});
