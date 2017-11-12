'use strict'

const express = require('express')
const imageUrl = require('../lib/image-url')
const request = require('supertest')
const scale = require('..')

const app = express()
const server = app.listen()
const port = server.address().port
app.use('/images', express.static('test/images'))
app.use('/scale1', scale({baseHost: 'localhost:' + port}))
app.use('/scale2', scale({
  baseHost: 'localhost:' + port,
  cors: {origin: 'http://example.com'},
}))

after(() => server.close())

describe('Test CORS', () => {
  it('should send Access-Control-Allow-Origin:* header', async () => {
    await request(app)
      .get(imageUrl('/scale1')(110, {url: '/images/a.jpg'}))
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200)
  })

  it('should send ACAO:example.com header', async () => {
    await request(app)
      .get(imageUrl('/scale2')(110, {url: '/images/a.jpg'}))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .expect(200)
  })
})
