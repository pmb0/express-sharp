'use strict';

var cors = require('cors');
var debug = require('debug')('express-sharp')
var etag = require('etag');
var express = require('express');
var http = require('http');
var sharp = require('sharp');
var url = require('url');
var expressValidator = require('express-validator');

var transform = function(width, height) {
  return sharp()
    .resize(width, height)
    .withoutEnlargement()
};

module.exports = function(options) {
  var router = express.Router();
  router.use(expressValidator({
    customValidators: {
      isSharpFormat: function(value) {
        return sharp.format.hasOwnProperty(value);
      },
      isQuality: function(value) {
        return value >= 0 && value <= 100;
      },
      isUrlPathQuery: function(value) {
        if (!value) {
          return false;
        }
        var u =  url.parse(value);
        if (u.protocol || u.host || !u.path) {
          return false;
        }
        return true;
      },
    },
  }));

  var _cors = cors(options.cors || {});

  router.get('/resize/:width/:height?', _cors, function(req, res, next) {
    var format = req.query.format;
    var quality = parseInt(req.query.quality, 10);

    req.checkParams('height').optional().isInt();
    req.checkParams('width').isInt();
    req.checkQuery('format').optional().isSharpFormat();
    req.checkQuery('quality').optional().isQuality();
    req.checkQuery('url').isUrlPathQuery();

    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).json(errors);
    }

    var imageUrl = url.parse(req.query.url);
    imageUrl.host = options.baseHost;
    imageUrl.protocol = imageUrl.protocol || 'http';
    imageUrl = url.format(imageUrl);

    var width = parseInt(req.params.width, 10);
    var height = req.params.height ? parseInt(req.params.height, 10) : undefined;

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
        debug('Requested %s. Status: %s', imageUrl, result.statusCode);
        if (result.statusCode >= 400) {
          return res.sendStatus(result.statusCode);
        }
        res.status(result.statusCode)
        res.type(format || result.headers['content-type']);
        result.pipe(transformer).pipe(res);
      })
      .on('error', function(err) {
        next(new Error(err));
      });
  });

  return router;
};
