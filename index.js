'use strict';

var stream = require('stream');
var Readable = stream.Readable;
var Transform = stream.Transform;

var util = require('util');

function InputBase(signalLevel) {
  Readable.call(this, { objectMode: true });
  this._signalLevel = signalLevel;
}
util.inherits(InputBase, Readable);

InputBase.prototype._read = function() {
  this.push(this._signalLevel);
  this.push(null);
};


function Not() {
  Transform.call(this, { objectMode: true });
}
util.inherits(Not, Transform);

Transform.prototype._transform = function(chunk, encoding, next) {
  this.push(!chunk);
  next();
};


module.exports = {
  InputHigh: function() { return new InputBase(true); },
  InputLow: function() { return new InputBase(false); },
  Not: function() { return new Not(); },
};
