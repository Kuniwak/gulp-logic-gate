'use strict';

var util = require('util');
var expect = require('chai').expect;
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


Prove.createProve = function(expectedValue, done) {
  return new Prove(function(chunk) {
    expect(chunk).to.equal(expectedValue);
    done();
  });
};


module.exports = Prove;
