'use strict';

var createProve = require('../prove.js').createProve;

var logicGate = require('../../index.js');
var Power = logicGate.Power;
var InputLow = logicGate.InputLow;
var InputHigh = logicGate.InputHigh;
var And = logicGate.And;
var Or = logicGate.Or;
var Not = logicGate.Not;
var Buf = logicGate.Buf;

describe('Stateless combinational logic circuit', function(){
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
      var inputA = new InputLow(power);
      var inputB = new InputLow(power);

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
      var inputA = new InputLow(power);
      var inputB = new InputHigh(power);

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
      var inputA = new InputHigh(power);
      var inputB = new InputLow(power);

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
      var inputA = new InputHigh(power);
      var inputB = new InputHigh(power);

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
});
