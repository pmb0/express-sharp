/* eslint-disable toplevel/no-toplevel-side-effect */

const express = require('express')
const app = express()
const scale = require('..')

const PORT = 3000

app.use('/scale', scale({ baseHost: 'lorempixel.com' }))

const server = app.listen(PORT, function() {
  const { address, port } = server.address()
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
