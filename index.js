'use strict';

var stream = require('stream');
var Readable = stream.Readable;
var Transform = stream.Transform;

var util = require('util');
var _ = require('lodash');
var HashMap = require('hashmap');


function Power() {
  Readable.call(this, { objectMode: true });
}
util.inherits(Power, Readable);

Power.prototype._read = function() {};

Power.prototype.turnOn = function() {
  this.push(true);
};


function InputBase(signalLevel) {
  Transform.call(this, { objectMode: true });
  this._signalLevel = signalLevel;
}
util.inherits(InputBase, Transform);

InputBase.prototype._transform = function(chunk, enc, next) {
  this.push(this._signalLevel);
  next();
};


function Buf() {
  Transform.call(this, { objectMode: true });
}
util.inherits(Buf, Transform);

Buf.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};


function Not() {
  Transform.call(this, { objectMode: true });
}
util.inherits(Not, Transform);

Not.prototype._transform = function(chunk, encoding, next) {
  this.push(!chunk);
  next();
};


function MultipleInputGate() {
  Transform.call(this, { objectMode: true });

  this._signalSourceMap = new HashMap();

  var self = this;

  this.on('pipe', function(source) {
    self._signalSourceMap.set(source, undefined);

    source.on('data', function(chunk) {
      self._signalSourceMap.set(source, chunk);

      var inputSignals = self._signalSourceMap.values();
      var isReady = !_.contains(inputSignals, undefined);
      if (isReady) {
        self.push(self._calculate(inputSignals));
      }
    });
  });

  this.on('unpipe', function(source) {
    self._signalSourceMap.remove(source);
  });
}
util.inherits(MultipleInputGate, Transform);

MultipleInputGate.prototype._transform = function(chunk, enc, next) { next(); };
MultipleInputGate.prototype._calculate = function() {
  throw new Error('not implemented');
};


function And() {
  MultipleInputGate.call(this);
}
util.inherits(And, MultipleInputGate);


And.prototype._calculate = function(inputSignals) {
  return _.every(inputSignals);
};


function Or() {
  MultipleInputGate.call(this);
}
util.inherits(Or, MultipleInputGate);


Or.prototype._calculate = function(inputSignals) {
  return _.some(inputSignals);
};


function Xor() {
  MultipleInputGate.call(this);
}
util.inherits(Xor, MultipleInputGate);


Xor.prototype._calculate = function(inputSignals) {
  var highCount = _.filter(inputSignals, function(signal) {
    return signal;
  }).length;

  return highCount % 2 === 1;
};


function Clock(life) {
  Transform.call(this, { objectMode: true });

  if (typeof life === 'number' && life <= 0) {
    throw new Error('life must be positive number, but come: ' + life);
  }

  this._time = 0;
  this._life = life;
}
util.inherits(Clock, Transform);

Clock.prototype._tick = function() {
  if (this._time >= this._life) {
    return;
  }

  this.push(this._time);
  this._time++;

  process.nextTick(this._tick.bind(this));
};

Clock.prototype._transform = function(chunk, enc, next) {
  this._tick();
  next();
};


function TimeSeriesInput(generator) {
  Transform.call(this, { objectMode: true });
  this._gen = generator;
}
util.inherits(TimeSeriesInput, Transform);

TimeSeriesInput.prototype._transform = function(chunk, enc, next) {
  this.push(this._gen(chunk));
  next();
};


function HazardFilter(steps) {
  Transform.call(this, { objectMode: true });
  this._steps = steps;
  this._cycle = 0;
}
util.inherits(HazardFilter, Transform);

HazardFilter.prototype._transform = function(chunk, enc, next) {
  if (this._cycle <= 0) {
    this.push(chunk);
    this._cycle = this._steps;
  }
  else {
    this._cycle--;
  }
  next();
};


module.exports = {
  Power: function() { return new Power(); },
  InputHigh: function(opt_power) {
    return new InputBase(true, opt_power);
  },
  InputLow: function(opt_power) {
    return new InputBase(false, opt_power);
  },
  Clock: function(life, opt_power) { return new Clock(life, opt_power); },
  TimeSeriesInput: function(generator) { return new TimeSeriesInput(generator); },
  Buf: function() { return new Buf(); },
  Not: function() { return new Not(); },
  And: function() { return new And(); },
  Or: function() { return new Or(); },
  Xor: function() { return new Xor(); },
  HazardFilter: function(step) { return new HazardFilter(step); },
};
