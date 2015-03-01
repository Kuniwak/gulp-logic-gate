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


function Not() {
  Transform.call(this, { objectMode: true });
}
util.inherits(Not, Transform);

Not.prototype._transform = function(chunk, encoding, next) {
  this.push(!chunk);
  next();
};


module.exports = {
  InputHigh: function() { return new InputBase(true); },
  InputLow: function() { return new InputBase(false); },
  Not: function() { return new Not(); },
};
