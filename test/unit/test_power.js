'use strict';

var expect = require('chai').expect;

var logicGate = require('../../index.js');
var Power = logicGate.Power;

describe('Power', function(){
  it('should fire an event "poweron" when turnOn called', function(done){
    var power = new Power();

    power.on('poweron', function() {
      var called = true;
      expect(called).to.be.true;
      done();
    });

    power.turnOn();
  });
});
