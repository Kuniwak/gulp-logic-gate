'use strict';

var _ = require('lodash');

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
var HazardFilter = logicGate.HazardFilter;
var EdgeTrigger = logicGate.EdgeTrigger;

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

      var inputs1 = new TimeSeriesInput(function(time) {
        return time % 4 > 1; // Create [ false, false, true, true ]
      });
      var inputs2 = new TimeSeriesInput(function(time) {
        return time % 2 > 0; // Create [ false, true, false, true ]
      });

      var and = new And();

      power.pipe(clock);
      clock.pipe(inputs1).pipe(and);
      clock.pipe(inputs2).pipe(and);

      var prove = createSequentialProve([false, false, false, true], done);

      // The output has hazards at intervals of 1 clock.
      // In this example, [ false, HAZARD, false, HAZARD, false, HAZARD, true ].
      and.pipe(new HazardFilter(1)).pipe(prove);

      power.turnOn();
    });
  });



  describe('D flip-flop', function() {
    function DFlipFlop(inputE, inputD) {
      var outputNotQ = new Buf();
      var outputQ = new Buf();

      var notD = inputD.pipe(new Not());

      var and1 = new And();
      inputE.pipe(and1);
      notD.pipe(and1);

      var and2 = new And();
      inputE.pipe(and2);
      inputD.pipe(and2);

      var or1 = new Or();

      var initiator = inputE.pipe(new InputHigh());
      or1.on('data', _.once(function() {
        initiator.unpipe(or1);
        and1.pipe(new HazardFilter(1)).pipe(or1);

        outputNotQ.pipe(new EdgeTrigger()).pipe(or1);
      }));
      initiator.pipe(or1);

      var nor1 = or1.pipe(new Not());
      nor1.pipe(outputQ);

      var or2 = new Or();
      and2.pipe(new HazardFilter(1)).pipe(or2);
      outputQ.pipe(or2);

      var nor2 = or2.pipe(new Not());
      nor2.pipe(outputNotQ);

      return { Q: outputQ };
    }


    it('should be able to set a true', function(done){
      var power = new Power();
      var clock = power.pipe(new Clock(1));

      var inputSignalsE = [ true ];
      var inputSignalsD = [ true ];

      var inputE = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsE.shift();
      }));
      var inputD = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsD.shift();
      }));

      var ff = new DFlipFlop(inputE, inputD, power);

      ff.Q.pipe(createSequentialProve([
        /* initial state */ false,
        /* set state     */ true,
      ], done));

      power.turnOn();
    });


    it('should be able to set a false', function(done){
      var power = new Power();
      var clock = power.pipe(new Clock(1));

      var inputSignalsE = [ true ];
      var inputSignalsD = [ false ];

      var inputE = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsE.shift();
      }));
      var inputD = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsD.shift();
      }));

      var ff = new DFlipFlop(inputE, inputD, power);

      ff.Q.pipe(createSequentialProve([
        false, // initial state
        false, // reset state
      ], done));

      power.turnOn();
    });


    it('should be able to store a true', function(done){
      var power = new Power();
      var clock = power.pipe(new Clock(2));

      var inputSignalsE = [ true, false ];
      var inputSignalsD = [ true, false ];

      var inputE = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsE.shift();
      }));
      var inputD = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsD.shift();
      }));

      var ff = new DFlipFlop(inputE, inputD, power);

      ff.Q.pipe(createSequentialProve([
        false, // initial state
        true, // set state
        true, // stored state
      ], done));

      power.turnOn();
    });


    it('should be able to store a false', function(done){
      var power = new Power();
      var clock = power.pipe(new Clock(2));

      var inputSignalsE = [ true, false ];
      var inputSignalsD = [ false, false ];

      var inputE = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsE.shift();
      }));
      var inputD = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsD.shift();
      }));

      var ff = new DFlipFlop(inputE, inputD, power);

      ff.Q.pipe(createSequentialProve([
        false, // initial state
        false, // set state
        false, // stored state
      ], done));

      power.turnOn();
    });


    it('should be able to store a false after storing a true', function(done){
      var power = new Power();
      var clock = power.pipe(new Clock(4));

      var inputSignalsE = [ true, false, true, false ];
      var inputSignalsD = [ true, false, false, false ];

      var inputE = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsE.shift();
      }));
      var inputD = clock.pipe(new TimeSeriesInput(function() {
        return inputSignalsD.shift();
      }));

      var ff = new DFlipFlop(inputE, inputD, power);

      ff.Q.pipe(Prove.createLogProve('Q'));

      ff.Q.pipe(createSequentialProve([
        false, // initial state
        true, // set state
        true, // stored state
        false, // reset state
        false, // stored state
      ], done));

      power.turnOn();
    });
  });
});
