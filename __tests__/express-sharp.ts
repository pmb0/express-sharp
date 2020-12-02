import express from 'express'
import { AddressInfo } from 'net'
import { join } from 'path'
import 'reflect-metadata'
import sharp from 'sharp'
import request from 'supertest'
import { URL } from 'url'
import { createClient, expressSharp, FsAdapter } from '../src'

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
  it('should respond with 404', async () => {
    await request(app).get('/my-scale/resize').expect(404)
  })

  it('should respond with 400 (invalid width)', async () => {
    await request(app).get('/my-scale/whatever?w=100a').expect(400)
  })

  it('should respond with 400 if quality is invalid', async () => {
    await request(app)
      .get(url('/a.jpg', { quality: -1, width: 100 }))
      .expect(400)
  })

  it('should respond with 200 (quality=1)', async () => {
    await request(app)
      .get(url('/a.jpg', { quality: 1, width: 100 }))
      .expect(200)
  })

  it('should respond with 400 (invalid quality)', async () => {
    await request(app)
      .get(url('/a.jpg', { quality: 101, width: 100 }))
      .expect(400)
  })

  it('should respond with 200 (quality=100)', async () => {
    await request(app)
      .get(url('/a.jpg', { quality: 100, width: 100 }))
      .expect(200)
  })

  it('should respond with 404 (image id does not exist)', async () => {
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
      .get(url('/a.jpg', { quality: 5, width: 110 }))
      .expect(200)
    expect(res.body.byteLength).toBeLessThan(5000)
    const { width } = await sharp(res.body).metadata()
    expect(width).toBe(110)
  })

  it('should change content type to image/png', async () => {
    await request(app)
      .get(url('/a.jpg', { format: 'png', width: 110 }))
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

  // (false-positive)
  // eslint-disable-next-line jest/expect-expect
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
          crop: true,
          gravity: 'west',
          height: 42,
          width: 55,
        }),
      )
      .expect(200)

    const { width, height } = await sharp(response.body).metadata()
    expect(width).toBe(55)
    expect(height).toBe(42)
  })

  it('should restrict crop to cropMaxSize (width > height)', async () => {
    const res = await request(app)
      .get(
        url('/a.jpg', {
          crop: true,
          height: 2000,
          width: 4000,
        }),
      )
      .expect(200)
    const { width, height } = await sharp(res.body).metadata()
    expect(width).toBe(2000)
    expect(height).toBe(1000)
  })

  it('should restrict crop to cropMaxSize (height > width)', async () => {
    const res = await request(app)
      .get(
        url('/a.jpg', {
          crop: true,
          height: 6000,
          width: 3000,
        }),
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
          crop: true,
          // @ts-ignore
          gravity: 'does not exist',

          height: 100,

          width: 100,
        }),
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
    // If this test fails, the If-None-Match value may need to be updated.
    const response = await request(app)
      .get(url('/a.jpg', { width: 110 }))
      .set('If-None-Match', 'W/"55-N6qlcSh59aTpUfPRkyE1N1BiYmk"')

    expect(response.body).toEqual({})
  })

  it('allows underscores in file names', async () => {
    await request(app).get(url('/foo-_A.jpg', {})).expect(200)
  })

  it('transforms zade4np6qh-bardokat-designs-makramee-schlusselanhanger-noa-hellgrau.jpg', async () => {
    await request(app)
      .get(
        url(
          '/zade4np6qh-bardokat-designs-makramee-schlusselanhanger-noa-hellgrau.jpg',
          {},
        ),
      )
      .expect(200)
  })
})
