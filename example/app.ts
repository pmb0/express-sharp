/* eslint-disable toplevel/no-toplevel-side-effect */
import { join } from 'path'
import express from 'express'
import { expressSharp, HttpAdapter, FsAdapter } from '..'
import { AddressInfo } from 'net'
import Keyv from 'keyv'

// Cache in-memory
const cache = new Keyv({ namespace: 'express-sharp' })

// Cache using Redis
// const cache = new Keyv('redis://', { namespace: 'express-sharp' })

const app = express()
const PORT = 3000

app.use(express.static(join(__dirname, 'public')))
app.use(express.static(join(__dirname, 'images')))

app.use(
  '/local-http',
  expressSharp({
    cache,
    imageAdapter: new HttpAdapter({
      prefixUrl: 'http://localhost:3000/',
    }),
  })
)
app.use(
  '/lorempixel',
  expressSharp({
    cache,
    imageAdapter: new HttpAdapter({ prefixUrl: 'http://lorempixel.com' }),
  })
)
app.use(
  '/fs',
  expressSharp({
    cache,
    imageAdapter: new FsAdapter(join(__dirname, 'images')),
  })
)

app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>express-sharp example</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <style>
      body {
        max-width: 800px;
        margin: auto;
      }
    </style>
  </head>
  <body>
    <h1>Example</h1>
    <h2>Local HTTP URLs:</h2>
    <ul>
      <li><a href="/local-http/resize/500?url=%2F1.jpeg">/images/1.jpeg (500 px)</a></li>
      <li><a href="/local-http/resize/500?url=%2F1.jpeg&quality=1">/images/1.jpeg (500 px, 1% quality)</a></li>
      <li><a href="/local-http/resize/500/500?url=%2F1.jpeg&gravity=east&crop=true">/images/1.jpeg (Cropped to 500 px)</a></li>
    </ul>
    <h2>Remote HTTP (Lorempixel):</h2>
    <ul>
      <li><a href="/lorempixel/resize/300?url=%2F600%2F1000">/600/1000 (300 px)</a></li>
    </ul>
    <h2>FS</h2>
    <ul>
      <li><a href="/fs/resize/500?url=%2F1.jpeg">/images/1.jpeg (500 px)</a></li>
    </ul>

    <test-example
      base="/fs"
      url="/1.jpeg"
      width="2000"
    ></test-example>

    <test-example
      base="/fs"
      url="/1.jpeg"
      quality="5"
      width="200"
      height="300"
      crop="east"
    ></test-example>

    <test-example
      base="/fs"
      url="/1.jpeg"
      quality="90"
      width="200"
      height="400"
      crop="east"
    ></test-example>

    <test-example
      base="/lorempixel"
      url="/500/500"
      width="500"
    ></test-example>

    <script type="module" src="example.mjs"></script>
  </body>
  </html>
  `)
})

const server = app.listen(PORT, function () {
  const { address, port } = server.address() as AddressInfo
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
