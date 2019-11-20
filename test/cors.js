'use strict'

const express = require('express')
const imageUrl = require('../lib/image-url')
const request = require('supertest')
const scale = require('..')

const app = express()
const images = express()
images.use('/images', express.static('test/images'))
let imageServer

before(done => {
  imageServer = images.listen(0, '0.0.0.0', () => {
    const { address, port } = imageServer.address()
    const baseHost = `${address}:${port}`

    app.use('/images', express.static('test/images'))
    app.use('/scale1', scale({baseHost}))
    app.use('/scale2', scale({
      baseHost,
      cors: {origin: 'http://example.com'}
    }))
    done()
  })
})

after(done => imageServer.close(done))

describe('Test CORS', () => {
  it('should send Access-Control-Allow-Origin:* header', async () => {
    await request(app)
      .get(imageUrl('/scale1/images/a.jpg'))
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200)
  })

  it('should send ACAO:example.com header', async () => {
    await request(app)
      .get(imageUrl('/scale2/images/a.jpg'))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .expect(200)
  })
})
