/* eslint-disable toplevel/no-toplevel-side-effect */
import { join } from 'path'
import express from 'express'
// import { getImageUrl } from '..'
import { expressSharp, HttpAdapter, FsAdapter } from '..'
import { AddressInfo } from 'net'
import Keyv from 'keyv'

const cache = new Keyv({ namespace: 'express-sharp' })
// const cache = new Keyv('redis://', { namespace: 'express-sharp' })

const app = express()
const PORT = 3000

app.use(express.static(join(__dirname, '../../example/images')))

app.use(
  '/local-http',
  expressSharp({
    cache,
    imageAdapter: new HttpAdapter({
      prefixUrl: 'http://localhost:3000/',
      cache,
    }),
  })
)
app.use(
  '/lorempixel',
  expressSharp({
    imageAdapter: new HttpAdapter({ prefixUrl: 'http://lorempixel.com' }),
  })
)
app.use(
  '/fs',
  expressSharp({
    imageAdapter: new FsAdapter(join(__dirname, '../../example/images')),
  })
)

app.get('/', (req, res) => {
  res.send(`
    <h1>Example</h1>
    <h2>Local HTTP URLs:</h2>
    <ul>
      <li><a href="/local-http/resize/500?url=%2F1.jpeg">/images/1.jpeg (500 px)</a></li>
      <li><a href="/local-http/resize/500?url=%2F1.jpeg&quality=1">/images/1.jpeg (500 px, 1% quality)</a></li>
      <li><a href="/local-http/resize/500/500?url=%2F1.jpeg&gravity=east&crop=true">/images/1.jpeg (Cropped to 500 px)</a></li>
    </ul>
    <h2>Lorempixel:</h2>
    <ul>
      <li><a href="/lorempixel/resize/300?url=%2F600%2F1000">/600/1000 (300 px)</a></li>
    </ul>
  `)
})

const server = app.listen(PORT, function() {
  const { address, port } = server.address() as AddressInfo
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
