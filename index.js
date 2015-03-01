'use strict';

var Readable = require('stream').Readable;
var util = require('util');

function InputHigh() {
  Readable.call(this, { objectMode: true });
}
util.inherits(InputHigh, Readable);

InputHigh.prototype._read = function() {
  this.push(true);
  this.push(null);
};


module.exports = {
  InputHigh: InputHigh,
};
