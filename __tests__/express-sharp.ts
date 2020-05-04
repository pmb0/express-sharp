import { expressSharp, FsAdapter } from '..'
import express from 'express'
import { imageUrl as imageUrl_ } from '../src/image-url'
import request from 'supertest'
import sharp from 'sharp'
import { join } from 'path'

const imageAdapter = new FsAdapter(join(__dirname, 'images'))
const imageUrl = imageUrl_('/my-scale')
const app = express()
const server = app.listen()

app.use('/my-scale', expressSharp({ imageAdapter }))

afterAll(() => server.close())

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

  it('should respond with 400', async () => {
    await request(app)
      .get(imageUrl(100, { url: 'a.jpg', quality: -1 }))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(imageUrl(100, { url: 'a.jpg', quality: 1 }))
      .expect(200)
  })

  it('should respond with 400', async () => {
    await request(app)
      .get(imageUrl(100, { url: 'a.jpg', quality: 101 }))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(imageUrl(100, { url: 'a.jpg', quality: 100 }))
      .expect(200)
  })

  it('should respond with 404', async () => {
    await request(app)
      .get(imageUrl(100, { url: '/does-not-exist' }))
      .expect(404)
  })

  it('should resize /images/a.jpg to 100px', async () => {
    const res = await request(app)
      .get(imageUrl(100, { url: 'a.jpg' }))
      .expect(200)

    expect(res.body.byteLength).toBeLessThan(5000)

    const { width } = await sharp(res.body).metadata()
    expect(width).toBe(100)
  })

  it('should resize /images/a.jpg to 110px, 5% quality', async () => {
    const res = await request(app)
      .get(imageUrl(110, { url: 'a.jpg', quality: 5 }))
      .expect(200)
    expect(res.body.byteLength).toBeLessThan(5000)
    const { width } = await sharp(res.body).metadata()
    expect(width).toBe(110)
  })

  it('should change content type to image/png', async () => {
    await request(app)
      .get(imageUrl(110, { url: 'a.jpg', format: 'png' }))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type png', async () => {
    await request(app)
      .get(imageUrl(110, { url: 'b.png' }))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type jpeg', () => {
    return request(app)
      .get(imageUrl(110, { url: 'a.jpg' }))
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
  })

  it('should use webp if supported', async () => {
    await request(app)
      .get(imageUrl(110, { url: 'a.jpg' }))
      .set('Accept', 'image/webp')
      .expect('Content-Type', 'image/webp')
      .expect(200)
  })

  it('should crop /images/a.jpg to 55px x 42px', async () => {
    const response = await request(app)
      .get(
        imageUrl([55, 42], {
          url: 'a.jpg',
          crop: true,
          gravity: 'west',
        })
      )
      .expect(200)

    const { width, height } = await sharp(response.body).metadata()
    expect(width).toBe(55)
    expect(height).toBe(42)
  })

  it('should restrict crop to cropMaxSize', async () => {
    const res = await request(app)
      .get(
        imageUrl([4000, 2000], {
          url: 'a.jpg',
          crop: true,
        })
      )
      .expect(200)
    const { width, height } = await sharp(res.body).metadata()
    expect(width).toBe(2000)
    expect(height).toBe(1000)
  })

  it('should restrict crop to cropMaxSize', async () => {
    const res = await request(app)
      .get(imageUrl([3000, 6000], { url: 'a.jpg', crop: true }))
      .expect(200)
    const { width, height } = await sharp(res.body).metadata()
    expect(width).toBe(1000)
    expect(height).toBe(2000)
  })

  it('should respond with 400 with wrong gravity', async () => {
    await request(app)
      .get(
        imageUrl([100, 100], {
          url: 'a.jpg',
          crop: true,
          gravity: 'easter',
        })
      )
      .expect(400)
  })

  it('should contain ETag header', async () => {
    await request(app)
      .get(imageUrl(110, { url: 'a.jpg' }))
      .expect('ETag', /W\/".*"/)
      .expect(200)
  })

  it('should use If-None-Match header', async () => {
    const response = await request(app)
      .get(imageUrl(110, { url: 'a.jpg' }))
      .set('If-None-Match', 'W/"49-a9D9Enel6fA9KO/N7YMR5oGJ/E4"')
      .expect(304)

    expect(response.body).toEqual({})
  })
})
