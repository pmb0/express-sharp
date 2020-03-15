/* eslint-disable toplevel/no-toplevel-side-effect */
import { join } from 'path'
import express from 'express'
import scale from '../src/middleware'
import { AddressInfo } from 'net'

const app = express()
const PORT = 3000

app.use(express.static(join(__dirname, 'images')))

app.use('/local', scale())
app.use('/lorempixel', scale({ baseHost: 'lorempixel.com' }))

app.get('/', (req, res) => {
  res.send(`
    <h1>Example</h1>
    <h2>Local URLs:</h2>
    <ul>
      <li><a href="/local/resize/500?url=%2F1.jpeg">/images/1.jpeg (500 px)</a></li>
      <li><a href="/local/resize/500?url=%2F1.jpeg&quality=1">/images/1.jpeg (500 px, 1% quality)</a></li>
      <li><a href="/local/resize/500/500?url=%2F1.jpeg&gravity=east&crop=true">/images/1.jpeg (Cropped to 500 px)</a></li>
    </ul>
    <h2>Lorempixel:</h2>
    <ul>
      <li><a href="/lorempixel/resize/300?url=%2F600%2F600">/600/600 (300 px)</a></li>
    </ul>
  `)
})

const server = app.listen(PORT, function() {
  const { address, port } = server.address() as AddressInfo
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
