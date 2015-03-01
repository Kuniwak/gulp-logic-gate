'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var InputHigh = logicGate.InputHigh;
var Power = logicGate.Power;
var createProve = require('../prove.js').createProve;


describe('InputHigh', function(){
  function createPower() {
    return new Power();
  }

  it('should be a readable stream', function(){
    var high = new InputHigh();
    expect(high).to.be.instanceof(stream.Readable);
  });


  it('should be read as a true', function(done){
    var prove = createProve(true, done);

    var power = createPower();
    var high = new InputHigh(power);
    high.pipe(prove);

    power.turnOn();
  });


  it('should be read as a true always', function(done){
    var power = createPower();
    var high = new InputHigh(power);

    Promise.all([
      new Promise(function(onFulfilled) {
        high.pipe(createProve(true, onFulfilled));
      }),
      new Promise(function(onFulfilled) {
        high.pipe(createProve(true, onFulfilled));
      }),
    ]).then(function() { done(); });

    process.nextTick(function() {
      power.turnOn();
    });
  });
});
