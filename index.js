'use strict'

const cors = require('cors')
const debug = require('debug')('express-sharp')
const etag = require('etag')
const express = require('express')
const expressValidator = require('express-validator')
const request = require('request-promise')
const sharp = require('sharp')
const transform = require('./lib/transform')
const url = require('url')

const getImageUrl = function(baseHost, inputUrl) {
  let imageUrl = url.parse(inputUrl)
  imageUrl.host = baseHost.replace('https://', '').replace('http://', '')
  imageUrl.protocol = baseHost.startsWith('https') ? 'https' : 'http'
  return url.format(imageUrl)
}

const isUrlPathname = function(value) {
  if (!value) {
    return false
  }
  const u = url.parse(value)
  if (u.protocol || u.host || !u.path) {
    return false
  }
  return true
}

module.exports = function(options) {
  debug('called with options: %O', options)
  const router = express.Router()
  router.use(expressValidator({
    customValidators: {
      isSharpFormat: function(value) {
        return sharp.format.hasOwnProperty(value)
      },
      isGravity: function(value) {
        return sharp.gravity.hasOwnProperty(value)
      },
      isQuality: function(value) {
        return value >= 0 && value <= 100
      }
    },
  }))

  const _cors = cors(options.cors || {})

  const handler = async (req, res, next) => {
    req.checkQuery('height').optional().isInt()
    req.checkQuery('width').optional().isInt()
    req.checkQuery('format').optional().isSharpFormat()
    req.checkQuery('quality').optional().isQuality()
    req.checkQuery('progressive').optional().isBoolean()
    req.checkQuery('crop').optional().isBoolean()
    req.checkQuery('gravity').optional().isGravity()

    const errors = req.validationErrors() || []

    if (!isUrlPathname(req.path)) {
      errors.push({
        message: `pathname ${req.path} is not a valid relative URL path`
      })
    }

    if (errors.length > 0) {
      return res.status(400).json(errors)
    }

    debug('query %o is valid', req.query)

    let format = req.query.format
    if (req.headers.accept && req.headers.accept.indexOf('image/webp') !== -1) {
      format = format || 'webp'
    }
    const quality = parseInt(req.query.quality || 75, 10)

    const imageUrl = getImageUrl(options.baseHost, req.path)

    const width = parseInt(req.query.width, 10) || null
    const height = parseInt(req.query.height, 10) || null
    const crop = req.query.crop === 'true'
    const gravity = req.query.gravity

    debug('%o parsed from %s', { width, height, crop, gravity }, imageUrl)

    try {
      const etagBuffer = Buffer.from([imageUrl, width, height, format, quality])
      res.setHeader('ETag', etag(etagBuffer, {weak: true}))
      if (req.fresh) return res.sendStatus(304)

      debug('Requesting:', imageUrl)
      let response = await request({
        rejectUnauthorized: String(process.env.NODE_TLS_REJECT_UNAUTHORIZED) !== '0',
        encoding: null,
        uri: imageUrl,
        resolveWithFullResponse: true,
      })

      debug('Requested %s. Status: %s', imageUrl, response.statusCode)
      if (response.statusCode >= 400) {
        return res.sendStatus(response.statusCode)
      }

      res.status(response.statusCode)
      const inputFormat = response.headers['content-type'] || ''
      format = format || inputFormat.replace('image/', '')

      format = sharp.format.hasOwnProperty(format) ? format : 'jpeg'

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
module.exports.getImageUrl = getImageUrl
