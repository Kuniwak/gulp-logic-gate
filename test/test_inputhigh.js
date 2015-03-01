'use strict';

var expect = require('chai').expect;
var stream = require('stream');
var _ = require('lodash');

var InputHigh = require('../index.js').InputHigh;


describe('InputHigh', function(){
  function createProve(callback) {
    var prove = new stream.Writable({ objectMode: true });
    prove._write = function(chunk, enc, next) {
      callback(chunk);
      next();
    };

    return prove;
  }

  it('should be a readable stream', function(){
    var high = new InputHigh();
    expect(high).to.be.instanceof(stream.Readable);
  });


  it('should return a true', function(){
    var high = new InputHigh();
    expect(high.read()).to.be.true;
  });


  it('should be read as a true', function(done){
    var prove = createProve(function(chunk) {
      expect(chunk).to.be.true;
      done();
    });

    var high = new InputHigh();
    high.pipe(prove);
  });


  it('should be read as a true always', function(done){
    var doneMap = { 1: false, 2: false };
    function doneIfBothDone(id) {
      doneMap[id] = true;
      if (_.every(_.values(doneMap))) {
        done();
      }
    }

    var prove1 = createProve(function(chunk) {
      expect(chunk).to.be.true;
      doneIfBothDone(1);
    });

    var prove2 = createProve(function(chunk) {
      expect(chunk).to.be.true;
      doneIfBothDone(2);
    });

    var high = new InputHigh();
    high.pipe(prove1);
    high.pipe(prove2);
  });
});
