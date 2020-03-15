/* eslint-disable no-magic-numbers */
/* eslint-disable toplevel/no-toplevel-side-effect */

import express from 'express'
import imageUrl from '../src/image-url'
import request from 'supertest'
import scale from '../src/middleware'
import { join } from 'path'
import { AddressInfo } from 'net'

const app = express()
const server = app.listen()
const { port } = server.address() as AddressInfo

app.use('/images', express.static(join(__dirname, 'images')))
app.use('/scale1', scale({ baseHost: `localhost:${port}` }))
app.use(
  '/scale2',
  scale({
    baseHost: `localhost:${port}`,
    cors: { origin: 'http://example.com' },
  })
)

afterAll(() => server.close())

describe('Test CORS', () => {
  it('should send Access-Control-Allow-Origin:* header', async () => {
    await request(app)
      .get(imageUrl('/scale1')(110, { url: '/images/a.jpg' }))
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200)
  })

  it('should send ACAO:example.com header', async () => {
    await request(app)
      .get(imageUrl('/scale2')(110, { url: '/images/a.jpg' }))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .expect(200)
  })
})
