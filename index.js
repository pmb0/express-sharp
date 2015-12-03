'use strict';

var debug = require('debug')('express-sharp')
var etag = require('etag');
var express = require('express');
var http = require('http');
var sharp = require('sharp');
var url = require('url');
var validator = require('validator');

var router = express.Router();

var options = {};

var validateWith = function(validator) {
  return function(req, res, next, val) {
    if (validator(val)) {
      return next();
    }
    res.sendStatus(400);
  }
};

var transform = function(width, height) {
  return sharp()
    .resize(width, height)
    .withoutEnlargement()
};

router.param('height', validateWith(validator.isNumeric));
router.param('width', validateWith(validator.isNumeric));

router.get('/resize/:width/:height?', function(req, res, next) {
  var format = req.query.format;
  var quality = parseInt(req.query.quality, 10);

  if (
    !validator.isURL(req.query.url) ||
    (format && !sharp.format.hasOwnProperty(format)) ||
    (quality && !validator.isNumeric(quality))
  ) {
    return res.sendStatus(400);
  }

  var imageUrl = url.parse(req.query.url);
  imageUrl.host = options.baseHost;
  if (imageUrl.port !== null) {
    imageUrl.host += ':' + imageUrl.port;
  }
  imageUrl = url.format(imageUrl);

  var width = parseInt(req.params.width, 10);
  var height = parseInt(req.params.height, 10);

  var transformer = transform(width, height)
    .on('error', function sharpError(err) {
      res.status(500);
      next(new Error(err));
    });

  if (req.query.progressive) {
    transformer.progressive();
  }

  if (format) {
    transformer.toFormat(format);
  }

  if (quality) {
    transformer.quality(quality)
  }

  var etagBuffer = new Buffer([imageUrl, width, height, format, quality]);
  res.setHeader('ETag', etag(etagBuffer, {weak: true}))
  if (req.fresh) {
    return res.sendStatus(304);
  }

  debug('Requesting:', imageUrl);
  http
    .get(imageUrl, function getImage(result) {
      debug(imageUrl, 'requested');
      res.status(result.statusCode)
      res.type(format || result.headers['content-type']);
      result.pipe(transformer).pipe(res);
    })
    .on('error', function(err) {
      next(new Error(err));
    });
});

module.exports = function(o) {
  options = o;
  return router;
};
