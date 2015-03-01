'use strict';

var util = require('util');
var Writable = require('stream').Writable;


function Prove(callback) {
  Writable.call(this, { objectMode: true });
  this._callback = callback;
}
util.inherits(Prove, Writable);


Prove.prototype._write = function(chunk, enc, next) {
  this._callback(chunk);
  next();
};


module.exports = Prove;
