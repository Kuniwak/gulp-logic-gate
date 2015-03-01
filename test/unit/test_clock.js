'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var createSequentialProve = require('../prove.js').createSequentialProve;


describe('Clock', function(){
  it('should be a readable stream', function(){
    var inputs = new Clock();
    expect(inputs).to.be.instanceof(stream.Readable);
  });


  it('should be read as a time series LH when given 1 as the life times', function(done){
    var power = new Power();
    var clock = new Clock(1);
    power.pipe(clock);

    var prove = createSequentialProve([0], done);
    clock.pipe(prove);

    power.turnOn();
  });


  it('should be read as a time series LHLH when given 2 as the life times', function(done){
    var power = new Power();
    var clock = new Clock(5, power);
    power.pipe(clock);

    var prove = createSequentialProve([0, 1, 2, 3, 4], done);
    clock.pipe(prove);

    power.turnOn();
  });
});
