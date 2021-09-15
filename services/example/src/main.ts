/* eslint-disable toplevel/no-toplevel-side-effect */
import { HttpAdapter } from '@edged/http-adapter'
import { S3Adapter } from '@edged/s3-adapter'
import express from 'express'
import { expressSharp, FsAdapter } from 'express-sharp'
import Keyv from 'keyv'
import { AddressInfo } from 'net'
import { join } from 'path'

// Cache in-memory
const cache = new Keyv({ namespace: 'express-sharp' })

// Cache using Redis
// const cache = new Keyv('redis://', { namespace: 'express-sharp' })

const app = express()
const PORT = 3000

app.use(express.static(join(__dirname, '../public')))
app.use(express.static(join(__dirname, '../images')))

app.use(
  '/local-http',
  expressSharp({
    cache,
    imageAdapter: new HttpAdapter({
      baseURL: 'http://localhost:3000/',
    }),
  }),
)

const awsBucket = process.env.AWS_BUCKET
if (!awsBucket) {
  throw new Error('AWS_BUCKET not set')
}

app.use(
  '/s3',
  expressSharp({
    cache: new Keyv(),
    imageAdapter: new S3Adapter(awsBucket),
  }),
)

app.use(
  '/lorempixel',
  expressSharp({
    cache,
    imageAdapter: new HttpAdapter({ baseURL: 'http://lorempixel.com' }),
  }),
)
app.use(
  '/fs',
  expressSharp({
    cache,
    imageAdapter: new FsAdapter(join(__dirname, '../images')),
  }),
)

app.set('views', join(__dirname, '../views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'express-sharp example' })
})

const server = app.listen(PORT, function () {
  const { address, port } = server.address() as AddressInfo
  // eslint-disable-next-line no-console
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
