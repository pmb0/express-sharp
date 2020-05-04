import express from 'express'
import { imageUrl } from '../src/image-url'
import request from 'supertest'
import { expressSharp, FsAdapter } from '..'
import { join } from 'path'

const app = express()
const server = app.listen()

const imageAdapter = new FsAdapter(join(__dirname, 'images'))

app.use('/scale1', expressSharp({ imageAdapter }))
app.use(
  '/scale2',
  expressSharp({ imageAdapter, cors: { origin: 'http://example.com' } })
)

afterAll(() => server.close())
describe('Test CORS', () => {
  it('should send Access-Control-Allow-Origin:* header', async () => {
    await request(app)
      .get(imageUrl('/scale1')(110, { url: '/images/a.jpg' }))
      .expect('Access-Control-Allow-Origin', '*')
  })

  it('should send a custom Access-Control-Allow-Origin header', async () => {
    await request(app)
      .get(imageUrl('/scale2')(110, { url: '/images/a.jpg' }))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
  })
})
