import express from 'express'
import { AddressInfo } from 'net'
import { join } from 'path'
import request from 'supertest'
import { createClient, expressSharp, FsAdapter } from '../src'

const app = express()
const server = app.listen()
const { address, port } = server.address() as AddressInfo

const scale1Url = createClient(`http://[${address}]:${port}/scale1`)
const scale2Url = createClient(`http://[${address}]:${port}/scale2`)

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
      .get(scale1Url.pathQuery('/a.jpg', { width: 110 }))
      .expect('Access-Control-Allow-Origin', '*')
  })

  it('should send a custom Access-Control-Allow-Origin header', async () => {
    await request(app)
      .get(scale2Url.pathQuery('/a.jpg', { width: 110 }))
      .expect('Access-Control-Allow-Origin', 'http://example.com')
  })
})
