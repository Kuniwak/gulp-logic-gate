'use strict';

var expect = require('chai').expect;
var stream = require('stream');

var InputHigh = require('../index.js').InputHigh;


describe('InputHigh', function(){
  it('should be a readable stream', function(){
    var high = new InputHigh();
    expect(high).to.be.instanceof(stream.Readable);
  });

  it('should return a true', function(){
    var high = new InputHigh();
    expect(high.read()).to.be.true;
  });

  it('should return a true always', function(done){
    var prove = new stream.Writable({ objectMode: true });
    prove._write = function(chunk, enc, next) {
      expect(chunk).to.be.true;
      next();
      done();
    };

    var high = new InputHigh();
    high.pipe(prove);
  });
});
