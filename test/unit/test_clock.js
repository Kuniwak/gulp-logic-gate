'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var Prove = require('../prove.js');


describe('Clock', function(){
  it('should be a readable stream', function(){
    var inputs = new Clock();
    expect(inputs).to.be.instanceof(stream.Readable);
  });


  function createSequentialProve(expectedOuputs, done) {
    return new Prove(function(chunk) {
      var expectedOuput = expectedOuputs.shift();
      expect(chunk).to.equal(expectedOuput);

      if (expectedOuputs.length <= 0) {
        done();
      }
    });
  }


  it('should be read as a time series LH when given 1 as the life times', function(done){
    var power = new Power();
    var clock = new Clock(1, power);

    var prove = createSequentialProve([false, true], done);
    clock.pipe(prove);

    power.turnOn();
  });


  it('should be read as a time series LHLH when given 2 as the life times', function(done){
    var power = new Power();
    var clock = new Clock(2, power);

    var prove = createSequentialProve([false, true, false, true], done);
    clock.pipe(prove);

    power.turnOn();
  });
});
