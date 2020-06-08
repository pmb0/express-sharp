/* eslint-disable toplevel/no-toplevel-side-effect */
import express from 'express'
import Keyv from 'keyv'
import { AddressInfo } from 'net'
import { join } from 'path'
import { expressSharp, FsAdapter, HttpAdapter } from '../src'

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

app.set('views', join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'express-sharp example' })
})

const server = app.listen(PORT, function () {
  const { address, port } = server.address() as AddressInfo
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
