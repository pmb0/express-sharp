'use strict'

const accepts = require('accepts')
const cors = require('cors')
const debug = require('debug')('express-sharp')
const etag = require('etag')
const express = require('express')
const expressValidator = require('express-validator')
const request = require('request-promise')
const sharp = require('sharp')
const transform = require('./lib/transform')
const url = require('url')

function defaultGetImageUrl(req, options) {
  let imageUrl = url.parse(req.path)
  imageUrl.host = options.baseHost.replace('https://', '').replace('http://', '')
  imageUrl.protocol = options.baseHost.startsWith('https') ? 'https' : 'http'
  return url.format(imageUrl)
}

module.exports = function(options) {
  debug('called with options: %O', options)
  const router = express.Router()
  router.use(expressValidator({
    customValidators: {
      isValueWebP: function(value) {
        return value === 'webp'
      },
      isGravity: function(value) {
        return sharp.gravity.hasOwnProperty(value)
      },
      isQuality: function(value) {
        return value >= 0 && value <= 100
      }
    },
  }))

  const getImageUrl = options.getImageUrl || defaultGetImageUrl

  const backendFetch = options.backendFetch || (async imageUrl => {
    const response = await request({
      rejectUnauthorized: String(process.env.NODE_TLS_REJECT_UNAUTHORIZED) !== '0',
      encoding: null,
      uri: imageUrl,
      resolveWithFullResponse: true,
    })
    return response
  })

  const _cors = cors(options.cors || {})

  const handler = async (req, res, next) => {
    req.checkQuery('auto').optional().isValueWebP()
    req.checkQuery('height').optional().isInt()
    req.checkQuery('width').optional().isInt()
    req.checkQuery('quality').optional().isQuality()
    req.checkQuery('progressive').optional().isBoolean()
    req.checkQuery('crop').optional().isBoolean()
    req.checkQuery('gravity').optional().isGravity()

    const errors = req.validationErrors() || []

    if (errors.length > 0) {
      return res.status(400).json(errors)
    }

    debug('query %o is valid', req.query)

    let format = req.query.format
    if (req.query.auto && accepts(req).type(['image/webp'])) {
      format = sharp.format.webp.id
    }
    const quality = parseInt(req.query.quality || 75, 10)

    const imageUrl = getImageUrl(req, options)

    const width = parseInt(req.query.width, 10) || null
    const height = parseInt(req.query.height, 10) || null
    const crop = req.query.crop === 'true'
    const gravity = req.query.gravity

    debug('%o parsed from %s', { width, height, crop, gravity }, imageUrl)

    try {
      const etagBuffer = Buffer.from([imageUrl, width, height, format, quality])
      res.setHeader('ETag', etag(etagBuffer, {weak: true}))
      if (req.fresh) return res.sendStatus(304)

      debug('Requesting %s', imageUrl)
      const response = await backendFetch(imageUrl)

      debug('Requested %s. Status: %s %s, Body: %s of length %s', imageUrl, typeof response.statusCode, response.statusCode, typeof response.body, response.body.length)

      res.status(response.statusCode)
      const inputFormat = response.headers['content-type'].toString()
      if (!format) {
        format = inputFormat.replace('image/', '')
        debug('Set format to %s from %s', format, inputFormat)
      }

      if (!sharp.format.hasOwnProperty(format) || !sharp.format[format].output.buffer) {
        debug('Provided format %s not found in legal formats %o. Fallback to jpeg', format, sharp.format)
        format = sharp.format.jpeg.id
      }

      res.type(`image/${format}`)

      const imageStream = transform(response.body, {
        crop,
        gravity,
        height,
        quality,
        format,
        width
      })

      imageStream.on('error', e => res.status(500).send(e))
      imageStream.pipe(res)
    } catch (e) {
      debug('encountered error with %s: %s', imageUrl, e)
      if (e.statusCode === 404) return next()
      next(e)
    }
  }

  router.get('*', _cors, handler)

  return router
}
module.exports.getImageUrl = defaultGetImageUrl
