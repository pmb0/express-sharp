'use strict'

const express = require('express')
const app = express()
const scale = require('..')

app.use('/scale', scale({baseHost: 'lorempixel.com'}))

const server = app.listen(3000, function() {
  const {address, port} = server.address()
  console.log('✔ Example app listening at http://%s:%s', address, port)
})
