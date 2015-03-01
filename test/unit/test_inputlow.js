'use strict';

var logicGate = require('../../index.js');
var InputLow = logicGate.InputLow;
var Power = logicGate.Power;
var createProve = require('../prove.js').createProve;


describe('InputLow', function(){
  it('should be read as a false', function(done){
    var power = new Power();
    var low = new InputLow();
    power.pipe(low);

    var prove = createProve(false, done);
    low.pipe(prove);

    power.turnOn();
  });


  it('should be read as a false always', function(done){
    var power = new Power();
    var low = new InputLow();
    power.pipe(low);

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
