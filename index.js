'use strict';

var stream = require('stream');
var EventEmitter = require('events').EventEmitter;
var Readable = stream.Readable;
var Transform = stream.Transform;

var util = require('util');
var _ = require('lodash');
var HashMap = require('hashmap');


function Power() {
  EventEmitter.call(this);
}
util.inherits(Power, EventEmitter);

Power.prototype.turnOn = function() {
  this.emit('poweron');
};

Power.default = new Power();


function InputBase(signalLevel, opt_power) {
  Readable.call(this, { objectMode: true });

  var self = this;
  var power = opt_power || Power.default;
  power.on('poweron', function() {
    self.push(signalLevel);
    self.push(null);
  });
}
util.inherits(InputBase, Readable);

InputBase.prototype._read = function() {};


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

MultipleInputGate.prototype._transform = function() {};
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


function Clock(life, opt_power) {
  Readable.call(this, { objectMode: true });

  if (typeof life === 'number' && life <= 0) {
    throw new Error('life must be positive number, but come: ' + life);
  }

  this._time = 0;
  this._life = life;

  var power = opt_power || Power.default;
  power.on('poweron', this._tick.bind(this));
}
util.inherits(Clock, Readable);

Clock.prototype._tick = function() {
  if (this._time >= this._life) {
    this.push(null);
    return;
  }

  this.push(this._time);
  this._time++;

  process.nextTick(this._tick.bind(this));
};

Clock.prototype._read = function() {};


function TimeSeriesInput(generator) {
  Transform.call(this, { objectMode: true });
  this._gen = generator;
}
util.inherits(TimeSeriesInput, Transform);

TimeSeriesInput.prototype._transform = function(chunk, enc, next) {
  this.push(this._gen(chunk));
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
};
