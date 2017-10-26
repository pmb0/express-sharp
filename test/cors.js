'use strict'

var express = require('express')
var imageUrl = require('../lib/image-url')
var request = require('supertest')
var scale = require('..')
var should = require('should')

var app = express()
var port = app.listen().address().port
app.use('/images', express.static('test/images'))
app.use('/scale1', scale({baseHost: 'localhost:' + port}))
app.use('/scale2', scale({
  baseHost: 'localhost:' + port,
  cors: {origin: 'http://example.com'},
}))

describe('Test CORS', function() {
  it('should send Access-Control-Allow-Origin:* header', function(done) {
    request(app)
      .get(imageUrl('/scale1')(110, {url: '/images/a.jpg'}))
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200, done)
  })

  it('should send ACAO:example.com header', function(done) {
    request(app)
      .get(imageUrl('/scale2')(110, {url: '/images/a.jpg'}))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .expect(200, done)
  })
})
