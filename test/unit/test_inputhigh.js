'use strict';

var expect = require('chai').expect;
var stream = require('stream');
var _ = require('lodash');

var logicGate = require('../../index.js');
var InputHigh = logicGate.InputHigh;
var Power = logicGate.Power;
var Prove = require('../prove.js');


describe('InputHigh', function(){
  function createProve(callback) {
    return new Prove(callback);
  }

  function createPower() {
    return new Power();
  }

  it('should be a readable stream', function(){
    var high = new InputHigh();
    expect(high).to.be.instanceof(stream.Readable);
  });


  it('should be read as a true', function(done){
    var prove = createProve(function(chunk) {
      expect(chunk).to.be.true;
      done();
    });

    var power = createPower();
    var high = new InputHigh(power);
    high.pipe(prove);

    power.turnOn();
  });


  it('should be read as a true always', function(done){
    var doneMap = { 1: false, 2: false };
    function doneIfBothDone(id) {
      doneMap[id] = true;
      if (_.every(_.values(doneMap))) {
        done();
      }
    }

    var prove1 = createProve(function(chunk) {
      expect(chunk).to.be.true;
      doneIfBothDone(1);
    });

    var prove2 = createProve(function(chunk) {
      expect(chunk).to.be.true;
      doneIfBothDone(2);
    });

    var power = createPower();
    var high = new InputHigh(power);
    high.pipe(prove1);

    process.nextTick(function() {
      high.pipe(prove2);

      power.turnOn();
    });
  });
});
