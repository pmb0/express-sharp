'use strict'

const {getImageUrl} = require('..')
const express = require('express')
const request = require('supertest')
const expressSharp = require('..')
const sharp = require('sharp')
const should = require('should')

const app = express()
const images = express()
images.use('/images', express.static('test/images'))
images.get('/images-server-error', (_, res) => res.sendStatus(500))
let imageServer

before(done => {
  imageServer = images.listen(0, '0.0.0.0', () => {
    app.get('/error', (_, res) => res.sendStatus(500))
    const { address, port } = imageServer.address()
    const baseHost = `${address}:${port}`
    app.use('/', expressSharp({baseHost}))
    done()
  })
})
after(done => imageServer.close(done))

describe('express-sharp', () => {
  it('responds with 400 when the query is invalid', async () => {
    await request(app)
      .get('/images/a.jpg?width=100&quality=-1')
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get('/images/a.jpg?width=100&quality=10')
      .expect(200)
  })

  it('should respond with 400', async () => {
    await request(app)
      .get('/images/a.jpg?width=100&quality=101')
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get('/images/a.jpg?width=100&quality=100')
      .expect(200)
  })

  it('should respond with 404', async () => {
    await request(app)
      .get('/does-not-exist?width=100')
      .expect(404)
  })

  it('should respond with 500 (backend error)', async () => {
    await request(app)
      .get('/error?width=100')
      .expect(500)
  })

  it('should respond with 500 (sharp error)', async () => {
    await request(app)
      .get('/images/invalid.jpg?width=100')
      .expect(500)
  })

  it('should respond with 500 (basehost error)', async () => {
    await request(app)
      .get('/images-server-error?width=500')
      .expect(500)
  })
  it('should resize /images/a.jpg to 100px', async () => {
    const res = await request(app)
      .get('/images/a.jpg?width=100')
      .expect(200)
    res.body.byteLength.should.be.below(5000)
    let {width} = await sharp(res.body).metadata()
    width.should.be.exactly(100)
  })

  it('should resize /images/a.jpg to 110px, 5% quality', async () => {
    const res = await request(app)
      .get('/images/a.jpg?width=110&quality=5')
      .expect(200)
    res.body.byteLength.should.be.below(1000)
    let {width} = await sharp(res.body).metadata()
    width.should.be.exactly(110)
  })

  it('should change content type to image/png', async () => {
    await request(app)
      .get('/images/a.jpg?width=110&format=png')
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type png', async () => {
    await request(app)
      .get('/images/b.png?width=100')
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type jpeg', () => {
    return request(app)
      .get('/images/a.jpg?width=130')
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
  })

  it('should fall back to jpeg', () => {
    return request(app)
      .get('/images/a.jpg?width=145&format=jpeg2')
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
  })
  it('should use webp if supported and auto=webp', async () => {
    await request(app)
      .get('/images/a.jpg?width=110&auto=webp')
      .set('Accept', 'image/jpeg')
      .expect('Content-Type', 'image/jpeg')
      .expect(200)

    await request(app)
      .get('/images/a.jpg?width=110&auto=webp')
      .set('Accept', 'image/webp')
      .expect('Content-Type', 'image/webp')
      .expect(200)
  })

  it('should crop /images/a.jpg to 55px x 42px', async () => {
    await request(app)
      .get('/images/a.jpg?width=55&height=42&crop=true&gravity=west')
      .expect(200)
      .then(async res => {
        const {width, height} = await sharp(res.body).metadata()
        width.should.be.exactly(55)
        height.should.be.exactly(42)
      })
  })

  it('should restrict crop to cropMaxSize', async () => {
    let res = await request(app)
      .get('/images/a.jpg?width=4000&height=2000&crop=true')
      .expect(200)
    const {width, height} = await sharp(res.body).metadata()
    should(width).be.exactly(2000)
    should(height).be.exactly(1000)
  })

  it('should restrict crop to cropMaxSize', async () => {
    const res = await request(app)
      .get('/images/a.jpg?width=3000&height=6000&crop=true')
      .expect(200)
    const {width, height} = await sharp(res.body).metadata()
    width.should.be.exactly(1000)
    height.should.be.exactly(2000)
  })

  it('should respond with 400 with wrong gravity', async () => {
    await request(app)
      .get('/images/a.jpg?width=100&height=100&crop=true&gravity=moon')
      .expect(400)
  })

  it('should contain ETag header', async () => {
    await request(app)
      .get('/images/a.jpg?width=110')
      .expect('ETag', /W\/".*"/)
      .expect(200)
  })

  it('should use If-None-Match header', async () => {
    await request(app)
      .get('/images/a.jpg?width=110')
      .set('If-None-Match', 'W/"5-7bbHFhm08wpZmpqEvZMZmEgN7IE"')
      .expect(res => res.body.should.be.empty())
      .expect(304)
  })

  it('should generate the correct image URL without protocol', () => {
    getImageUrl('domain.com', '/imageXY')
      .should.be.exactly('http://domain.com/imageXY')
  })

  it('should generate the correct image URL with http', () => {
    getImageUrl('http://domain.com', '/imageXY')
      .should.be.exactly('http://domain.com/imageXY')
  })

  it('should generate the correct image URL with https', () => {
    getImageUrl('https://domain.com', '/imageXY')
      .should.be.exactly('https://domain.com/imageXY')
  })
})
