'use strict';

var expect = require('chai').expect;
var stream = require('stream');
var _ = require('lodash');

var logicGate = require('../../index.js');
var InputLow = logicGate.InputLow;
var Power = logicGate.Power;
var Prove = require('../prove.js');


describe('InputLow', function(){
  function createProve(callback) {
    return new Prove(callback);
  }

  function createPower() {
    return new Power();
  }

  it('should be a readable stream', function(){
    var low = new InputLow();
    expect(low).to.be.instanceof(stream.Readable);
  });


  it('should be read as a false', function(done){
    var prove = createProve(function(chunk) {
      expect(chunk).to.be.false;
      done();
    });

    var power = createPower();
    var low = new InputLow(power);
    low.pipe(prove);

    power.turnOn();
  });


  it('should be read as a false always', function(done){
    var doneMap = { 1: false, 2: false };
    function doneIfBothDone(id) {
      doneMap[id] = true;
      if (_.every(_.values(doneMap))) {
        done();
      }
    }

    var prove1 = createProve(function(chunk) {
      expect(chunk).to.be.false;
      doneIfBothDone(1);
    });

    var prove2 = createProve(function(chunk) {
      expect(chunk).to.be.false;
      doneIfBothDone(2);
    });

    var power = createPower();
    var low = new InputLow(power);
    low.pipe(prove1);

    process.nextTick(function() {
      low.pipe(prove2);

      power.turnOn();
    });
  });
});
