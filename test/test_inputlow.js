'use strict';

var expect = require('chai').expect;
var stream = require('stream');
var _ = require('lodash');

var InputLow = require('../index.js').InputLow;
var Prove = require('./prove.js');


describe('InputLow', function(){
  function createProve(callback) {
    return new Prove(callback);
  }

  it('should be a readable stream', function(){
    var high = new InputLow();
    expect(high).to.be.instanceof(stream.Readable);
  });


  it('should return a false', function(){
    var high = new InputLow();
    expect(high.read()).to.be.false;
  });


  it('should be read as a false', function(done){
    var prove = createProve(function(chunk) {
      expect(chunk).to.be.false;
      done();
    });

    var high = new InputLow();
    high.pipe(prove);
  });


  it('should be read as a false always', function(done){
    var doneMap = { 1: false, 2: false };
    function doneIfBothDone(id) {
      doneMap[id] = true;
      if (_.every(_.values(doneMap))) {
        done();
      }
    }

    var prove1 = createProve(function(chunk) {
      expect(chunk).to.be.false;
      doneIfBothDone(1);
    });

    var prove2 = createProve(function(chunk) {
      expect(chunk).to.be.false;
      doneIfBothDone(2);
    });

    var high = new InputLow();
    high.pipe(prove1);
    high.pipe(prove2);
  });
});
