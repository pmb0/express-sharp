import express from 'express'
import { AddressInfo } from 'net'
// import sharp from 'sharp'
import { join } from 'path'
import request from 'supertest'
import { expressSharp, FsAdapter } from '..'
import { createClient } from '../src/express-sharp-client'
import { URL } from 'url'
import sharp from 'sharp'

const imageAdapter = new FsAdapter(join(__dirname, 'images'))
const app = express()
const server = app.listen()

app.use('/my-scale', expressSharp({ imageAdapter }))

const { address, port } = server.address() as AddressInfo

const client = createClient(`http://[${address}]:${port}/my-scale`)

afterAll(() => server.close())

function url(...args: Parameters<typeof client.url>): string {
  const url = new URL(client.url(...args))
  return url.pathname + url.search
}

describe('GET /my-scale/resize', () => {
  it('responds with a 400 if signed urls are enabled', () => {})

  it('should respond with 404', async () => {
    await request(app).get('/my-scale/resize').expect(404)
  })

  it('should respond with 400', async () => {
    await request(app).get('/my-scale/whatever?w=100a').expect(400)
  })

  it('should respond with 400 if quality is invalid', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 100, quality: -1 }))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 100, quality: 1 }))
      .expect(200)
  })

  it('should respond with 400', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 100, quality: 101 }))
      .expect(400)
  })

  it('should respond with 200', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 100, quality: 100 }))
      .expect(200)
  })

  it('should respond with 404', async () => {
    await request(app)
      .get(url('/does-not-exist.jpg', { width: 100 }))
      .expect(404)
  })

  it('should resize /images/a.jpg to 100px', async () => {
    const res = await request(app)
      .get(url('/a.jpg', { width: 100 }))
      .expect(200)

    expect(res.body.byteLength).toBeLessThan(5000)

    const { width } = await sharp(res.body).metadata()
    expect(width).toBe(100)
  })

  it('should resize /images/a.jpg to 110px, 5% quality', async () => {
    const res = await request(app)
      .get(url('/a.jpg', { width: 110, quality: 5 }))
      .expect(200)
    expect(res.body.byteLength).toBeLessThan(5000)
    const { width } = await sharp(res.body).metadata()
    expect(width).toBe(110)
  })

  it('should change content type to image/png', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 110, format: 'png' }))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type png', async () => {
    await request(app)
      .get(url('/b.png', { width: 110 }))
      .expect('Content-Type', 'image/png')
      .expect(200)
  })

  it('should auto detect content type jpeg', () => {
    return request(app)
      .get(url('/a.jpg', { width: 110 }))
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
  })

  it('should use webp if supported', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 110 }))
      .set('Accept', 'image/webp')
      .expect('Content-Type', 'image/webp')
      .expect(200)
  })

  it('should crop /images/a.jpg to 55px x 42px', async () => {
    const response = await request(app)
      .get(
        url('/a.jpg', {
          width: 55,
          height: 42,
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
        url('/a.jpg', {
          width: 4000,
          height: 2000,
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
      .get(
        url('/a.jpg', {
          width: 3000,
          height: 6000,
          crop: true,
        })
      )
      .expect(200)
    const { width, height } = await sharp(res.body).metadata()
    expect(width).toBe(1000)
    expect(height).toBe(2000)
  })

  it('should respond with 400 with wrong gravity', async () => {
    await request(app)
      .get(
        url('/a.jpg', {
          width: 100,
          height: 100,
          crop: true,
          // @ts-ignore
          gravity: 'does not exist',
        })
      )
      .expect(400)
  })

  it('should contain ETag header', async () => {
    await request(app)
      .get(url('/a.jpg', { width: 110 }))
      .expect('ETag', /W\/".*"/)
      .expect(200)
  })

  it('should use If-None-Match header', async () => {
    const response = await request(app)
      .get(url('/a.jpg', { width: 110 }))
      .set('If-None-Match', 'W/"49-a9D9Enel6fA9KO/N7YMR5oGJ/E4"')
      .expect(304)

    expect(response.body).toEqual({})
  })
})
