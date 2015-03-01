'use strict';

var through2 = require('through2');
var Prove = require('../prove.js');
var createProve = Prove.createProve;
var createSequentialProve = Prove.createSequentialProve;

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var Clock = logicGate.Clock;
var TimeSeriesInput = logicGate.TimeSeriesInput;
var InputLow = logicGate.InputLow;
var InputHigh = logicGate.InputHigh;
var And = logicGate.And;
var Or = logicGate.Or;
var Not = logicGate.Not;
var Buf = logicGate.Buf;

describe('Stateless combinational logic circuits', function(){
  describe('Half adder', function(){
    function HalfAdder(inputA, inputB) {
      var and1 = new And();
      var and2 = new And();
      var or = new Or();
      var not = new Not();

      var outputS = new Buf();
      var outputC = new Buf();

      inputA.pipe(and1);
      inputB.pipe(and1);
      inputA.pipe(or);
      inputB.pipe(or);

      and1.pipe(not);

      or.pipe(and2);
      not.pipe(and2);

      and1.pipe(outputC);
      and2.pipe(outputS);

      return {
        S: outputS,
        C: outputC,
      };
    }

    it('should be read as S=L, C=L when A=L, B=L', function(done){
      var power = new Power();
      var inputA = power.pipe(new InputLow());
      var inputB = power.pipe(new InputLow());

      var halfAdder = new HalfAdder(inputA, inputB);

      var outputS = halfAdder.S;
      var outputC = halfAdder.C;

      Promise.all([
        new Promise(function(onFulfilled) {
          outputS.pipe(createProve(false, onFulfilled));
        }),
        new Promise(function(onFulfilled) {
          outputC.pipe(createProve(false, onFulfilled));
        }),
      ]).then(function() { done(); });

      power.turnOn();
    });


    it('should be read as S=H, C=L when A=L, B=H', function(done){
      var power = new Power();
      var inputA = power.pipe(new InputLow());
      var inputB = power.pipe(new InputHigh());

      var halfAdder = new HalfAdder(inputA, inputB);

      var outputS = halfAdder.S;
      var outputC = halfAdder.C;

      Promise.all([
        new Promise(function(onFulfilled) {
          outputS.pipe(createProve(true, onFulfilled));
        }),
        new Promise(function(onFulfilled) {
          outputC.pipe(createProve(false, onFulfilled));
        }),
      ]).then(function() { done(); });

      power.turnOn();
    });


    it('should be read as S=H, C=L when A=H, B=L', function(done){
      var power = new Power();
      var inputA = power.pipe(new InputHigh());
      var inputB = power.pipe(new InputLow());

      var halfAdder = new HalfAdder(inputA, inputB);

      var outputS = halfAdder.S;
      var outputC = halfAdder.C;

      Promise.all([
        new Promise(function(onFulfilled) {
          outputS.pipe(createProve(true, onFulfilled));
        }),
        new Promise(function(onFulfilled) {
          outputC.pipe(createProve(false, onFulfilled));
        }),
      ]).then(function() { done(); });

      power.turnOn();
    });


    it('should be read as S=L, C=H when A=H, B=H', function(done){
      var power = new Power();
      var inputA = power.pipe(new InputHigh());
      var inputB = power.pipe(new InputHigh());

      var halfAdder = new HalfAdder(inputA, inputB);

      var outputS = halfAdder.S;
      var outputC = halfAdder.C;

      Promise.all([
        new Promise(function(onFulfilled) {
          outputS.pipe(createProve(false, onFulfilled));
        }),
        new Promise(function(onFulfilled) {
          outputC.pipe(createProve(true, onFulfilled));
        }),
      ]).then(function() { done(); });

      power.turnOn();
    });
  });

  describe('And gate with double time series inputs', function(){
    it('should be read as a time series LLLH when given LHLH and LLHH', function(done){
      var power = new Power();
      var clock = new Clock(4, power);
      power.pipe(clock);

      var inputs1 = new TimeSeriesInput(function(time) {
        return time % 4 > 1;
      });
      clock.pipe(inputs1);
      var inputs2 = new TimeSeriesInput(function(time) {
        return time % 2 > 0;
      });
      clock.pipe(inputs2);

      var and = new And();
      inputs1.pipe(and);
      inputs2.pipe(and);

      var flip = true;
      var noiseFilter = through2.obj(function(chunk, enc, next) {
        if (flip) {
          next(null, chunk);
        }
        else {
          next();
        }
        flip = !flip;
      });

      var prove = createSequentialProve([false, false, false, true], done);
      and.pipe(noiseFilter).pipe(prove);

      power.turnOn();
    });
  });
});
