'use strict';

var logicGate = require('../../index.js');
var InputHigh = logicGate.InputHigh;
var Power = logicGate.Power;
var createProve = require('../prove.js').createProve;


describe('InputHigh', function(){
  it('should be read as a true', function(done){
    var power = new Power();
    var high = new InputHigh();
    power.pipe(high);

    var prove = createProve(true, done);
    high.pipe(prove);

    power.turnOn();
  });


  it('should be read as a true always', function(done){
    var power = new Power();
    var high = new InputHigh();
    power.pipe(high);

    Promise.all([
      new Promise(function(onFulfilled) {
        high.pipe(createProve(true, onFulfilled));
      }),
      new Promise(function(onFulfilled) {
        high.pipe(createProve(true, onFulfilled));
      }),
    ]).then(function() { done(); });

    power.turnOn();
  });
});
