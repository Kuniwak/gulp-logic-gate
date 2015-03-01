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


var defaultPower = new Power();


function InputBase(signalLevel, opt_power) {
  Readable.call(this, { objectMode: true });

  var self = this;
  var power = opt_power || defaultPower;
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


module.exports = {
  Power: function() { return new Power(); },
  InputHigh: function(opt_power) {
    return new InputBase(true, opt_power);
  },
  InputLow: function(opt_power) {
    return new InputBase(false, opt_power);
  },
  Buf: function() { return new Buf(); },
  Not: function() { return new Not(); },
  And: function() { return new And(); },
  Or: function() { return new Or(); },
};
