'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var InputLow = logicGate.InputLow;
var Power = logicGate.Power;
var createProve = require('../prove.js').createProve;


describe('InputLow', function(){
  function createPower() {
    return new Power();
  }

  it('should be a readable stream', function(){
    var low = new InputLow();
    expect(low).to.be.instanceof(stream.Readable);
  });


  it('should be read as a false', function(done){
    var prove = createProve(false, done);

    var power = createPower();
    var low = new InputLow(power);
    low.pipe(prove);

    power.turnOn();
  });


  it('should be read as a false always', function(done){
    var power = createPower();
    var low = new InputLow(power);

    Promise.all([
      new Promise(function(onFulfilled) {
        low.pipe(createProve(false, onFulfilled));
      }),
      new Promise(function(onFulfilled) {
        low.pipe(createProve(false, onFulfilled));
      }),
    ]).then(function() { done(); });

    process.nextTick(function() {
      power.turnOn();
    });
  });
});
