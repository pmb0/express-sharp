'use strict';

var express = require('express');
var request = require('supertest')
var scale = require('..');
var sharp = require('sharp');
var should = require('should');

var app = express();
app.use('/my-scale', scale({baseHost: 'localhost'}));
app.use('/images', express.static('test/images'));

var imgUrl = function(path) {
  var port = app.listen().address().port;
  return encodeURIComponent('http://localhost:' + port + path)
}

describe('GET /my-scale/resize', function() {
  it('should respond with 404', function(done) {
    request(app).get('/my-scale/resize').expect(404, done);
  });

  it('should respond with 400', function(done) {
    request(app).get('/my-scale/resize/100').expect(400, done);
  });

  it('should respond with original image', function(done) {
    request(app)
      .get('/images/a.jpg')
      .expect('Content-Length', 1970087)
      .expect(200, done);
  });

  it('should resize /images/a.jpg to 100px', function(done) {
    request(app)
      .get('/my-scale/resize/100?url=' + imgUrl('/images/a.jpg'))
      .expect(function(res) {
        res.body.byteLength.should.be.exactly(3641);
        sharp(res.body).metadata(function(err, metadata) {
          metadata.width.should.be.exactly(100);
        });
      })
      .expect(200, done);
  });

  it('should resize /images/a.jpg to 110px, 50% quality', function(done) {
    request(app)
      .get('/my-scale/resize/110?quality=50&url=' + imgUrl('/images/a.jpg'))
      .expect(function(res) {
        res.body.byteLength.should.be.exactly(2472);
        sharp(res.body).metadata(function(err, metadata) {
          should(metadata.width).be.exactly(1110)
        });
      })
      .expect(200, done);
  });
});
