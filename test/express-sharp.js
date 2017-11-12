'use strict'

const {getImageUrl} = require('..')
const express = require('express')
const imageUrl = require('../lib/image-url')('/my-scale')
const request = require('supertest')
const scale = require('..')
const sharp = require('sharp')
const should = require('should')

const app = express()
const server = app.listen()
app.use('/images', express.static('test/images'))
app.get('/error', (req, res) => res.sendStatus(500))
app.get('/invalid-image', (req, res) => res.send('invalid image'))
const {port} = server.address()
app.use('/my-scale', scale({baseHost: `localhost:${port}`}))

after(() => server.close())

describe('GET /my-scale/resize', () => {
  it('should respond with 404', async () => {
    await request(app).get('/my-scale/resize').expect(404)
  })

  it('should respond with 400', async () => {
    await request(app).get('/my-scale/resize/100').expect(400)
  })

  it('should respond with 400', async () => {
    await request(app).get('/my-scale/resize/100a?url=/whatever').expect(400)
  })

  it('should respond with original image', async () => {
    await request(app)
      .get('/images/a.jpg')
      .expect('Content-Length', '1970087')
      .expect(200)
  })

  it('should respond with 400', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/images/a.jpg', quality: -1}))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/images/a.jpg', quality: 1}))
      .expect(200)
  })

  it('should respond with 400', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/images/a.jpg', quality: 101}))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/images/a.jpg', quality: 100}))
      .expect(200)
  })

  it('should respond with 404', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/does-not-exist'}))
      .expect(404)
  })

  it('should respond with 500 (backend error)', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/error'}))
      .expect(500)
  })

  it('should respond with 500 (sharp error)', async () => {
    await request(app)
      .get(imageUrl(100, {url: '/invalid-image'}))
      .expect(500)
  })

  it('should resize /images/a.jpg to 100px', async () => {
    const res = await request(app)
      .get(imageUrl(100, {url: '/images/a.jpg'}))
      .expect(200)
    res.body.byteLength.should.be.below(5000)
    let {width} = await sharp(res.body).metadata()
    width.should.be.exactly(100)
  })

  it('should resize /images/a.jpg to 110px, 5% quality', async () => {
    const res = await request(app)
      .get(imageUrl(110, {url: '/images/a.jpg', quality: 5}))
      .expect(200)
    res.body.byteLength.should.be.below(1000)
    let {width} = await sharp(res.body).metadata()
    width.should.be.exactly(110)
  })

  it('should change content type to image/png', async () => {
    await request(app)
      .get(imageUrl(110, {url: '/images/a.jpg', format: 'png'}))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type png', async () => {
    await request(app)
      .get(imageUrl(110, {url: '/images/b.png'}))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type jpeg', () => {
    return request(app)
      .get(imageUrl(110, {url: '/images/a.jpg'}))
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
  })

  it('should use webp if supported', async () => {
    await request(app)
      .get(imageUrl(110, {url: '/images/a.jpg'}))
      .set('Accept', 'image/webp')
      .expect('Content-Type', 'image/webp')
      .expect(200)
  })

  it('should crop /images/a.jpg to 55px x 42px', async () => {
    await request(app)
      .get(imageUrl(55, 42, {
        url: '/images/a.jpg',
        crop: true,
        gravity: 'west',
      }))
      .expect(200)
      .then(async res => {
        const {width, height} = await sharp(res.body).metadata()
        width.should.be.exactly(55)
        height.should.be.exactly(42)
      })
  })

  it('should restrict crop to cropMaxSize', async () => {
    let res = await request(app)
      .get(imageUrl(4000, 2000, {
        url: '/images/a.jpg',
        crop: true,
      }))
      .expect(200)
    const {width, height} = await sharp(res.body).metadata()
    should(width).be.exactly(2000)
    should(height).be.exactly(1000)
  })

  it('should restrict crop to cropMaxSize', async () => {
    const res = await request(app)
      .get(imageUrl(3000, 6000, { url: '/images/a.jpg', crop: true }))
      .expect(200)
    const {width, height} = await sharp(res.body).metadata()
    width.should.be.exactly(1000)
    height.should.be.exactly(2000)
  })

  it('should respond with 400 with wrong gravity', async () => {
    await request(app)
      .get(imageUrl(100, 100, {
        url: '/images/a.jpg',
        crop: true,
        gravity: 'easter',
      }))
      .expect(400)
  })

  it('should contain ETag header', async () => {
    await request(app)
      .get(imageUrl(110, {url: '/images/a.jpg'}))
      .expect('ETag', /W\/".*"/)
      .expect(200)
  })

  it('should use If-None-Match header', async () => {
    await request(app)
      .get(imageUrl(110, {url: '/images/a.jpg'}))
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
