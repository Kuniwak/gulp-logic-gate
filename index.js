'use strict';

var Readable = require('stream').Readable;
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


module.exports = {
  InputHigh: function() { return new InputBase(true); },
  InputLow: function() { return new InputBase(false); },
};
