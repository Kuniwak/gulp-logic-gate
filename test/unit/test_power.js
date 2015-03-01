'use strict';

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var createProve = require('../prove.js').createProve;

describe('Power', function(){
  it('should read a true when turnOn was invoked', function(done){
    var power = new Power();
    var prove = createProve(true, done);

    power.pipe(prove);
    power.turnOn();
  });
});
