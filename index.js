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

module.exports = function(options) {
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
      },
      isUrlPathQuery: function(value) {
        if (!value) {
          return false
        }
        const u = url.parse(value)
        if (u.protocol || u.host || !u.path) {
          return false
        }
        return true
      },
    },
  }))

  const _cors = cors(options.cors || {})
  router.get('/resize/:width/:height?', _cors, async (req, res, next) => {
    let format = req.query.format
    if (req.headers.accept && req.headers.accept.indexOf('image/webp') !== -1) {
      format = format || 'webp'
    }
    const quality = parseInt(req.query.quality || 75, 10)

    req.checkParams('height').optional().isInt()
    req.checkParams('width').isInt()
    req.checkQuery('format').optional().isSharpFormat()
    req.checkQuery('quality').optional().isQuality()
    req.checkQuery('progressive').optional().isBoolean()
    req.checkQuery('crop').optional().isBoolean()
    req.checkQuery('gravity').optional().isGravity()
    req.checkQuery('url').isUrlPathQuery()

    const errors = req.validationErrors()
    if (errors) {
      return res.status(400).json(errors)
    }

    const imageUrl = getImageUrl(options.baseHost, req.query.url)

    const width = parseInt(req.params.width, 10)
    const height = parseInt(req.params.height, 10) || null
    const crop = req.query.crop === 'true'
    const gravity = req.query.gravity

    try {
      const etagBuffer = Buffer.from([imageUrl, width, height, format, quality])
      res.setHeader('ETag', etag(etagBuffer, {weak: true}))
      if (req.fresh) return res.sendStatus(304)

      debug('Requesting:', imageUrl)
      let response = await request({
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
        width
      })

      imageStream.on('error', e => res.send(500, e))
      imageStream.pipe(res)
    } catch (e) {
      if (e.statusCode === 404) return next()
      next(e)
    }
  })

  return router
}
module.exports.getImageUrl = getImageUrl
