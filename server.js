const path = require('path')
const http = require('http')
const fs = require('fs')
const express = require('express')

const expressSharp = require('./')

const imageDir = path.resolve(__dirname, 'test', 'images')
const files = fs.readdirSync(imageDir)

function paramsFrom(dict) {
  const params = new URLSearchParams();
  Object.entries(dict).forEach(([name, value]) => params.set(name, value))
  return params
}

function serve(middleware) {
  return new Promise((resolve, reject) => {
    try {
      const app = express()
      app.use(middleware)
      const server = http.createServer(app)
      server.on('error', reject)
      server.listen(0, '0.0.0.0', () => {
        const { address, port } = server.address()
        resolve(`http://${address}:${port}`)
      })
    } catch (e) {
      reject(e)
    }
  });
}

async function main() {
  const baseHost = await serve(express.static(imageDir))
  const demo = express.Router()
  demo.use('/express-sharp', expressSharp({
    baseHost
  }))
  files.forEach(filename => {
    demo.get(`/${filename}/:width/:height`, (req, res) => {
      const original = new URL(filename, baseHost).href
      const params = paramsFrom({
        ...req.query,
        url: filename
      })
      const resized = `/express-sharp/resize/${req.params.width}/${req.params.height}?${params.toString()}`
      res.status(200).send(`

<html>
  <head>
    <title>Demo @express-sharp</title>
    <style>
      body {
        font-size: 16px;
        margin: 0;
        padding: 0;
        background-color: #${req.query.bg || 'ffeebb'};
      }
      figure {
        border: 1px solid black;
        padding: 2rem;
        margin: 1rem;
      }
    </style>
  </head>
  <body>
      <figure>
        <img src="${original}">
        <figcaption>Original ${filename}</figcaption>
      </figure>
      <figure>
        <img src="${resized}">
        <figcaption>Resized: ${resized}</figcaption>
      </figure>
  </body>
</html>
 `.trim())
    })
  })
  const demoURLBase = await serve(demo)
  files.forEach(filename => {
    const original = new URL(filename, baseHost).href
    const params = paramsFrom({
      auto: 'webp',
      progressive: true,
      url: original
    })
    console.log(new URL(`/${filename}/500/300?${params.toString()}`, demoURLBase).href)
  })
}

main()
