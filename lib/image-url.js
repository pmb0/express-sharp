'use strict'

var url = require('url')

module.exports = function(basePath) {
  return function(width, height, query) {
    if (typeof query === 'undefined') {
      query = height
    }
    if (width && width !== '') {
      query.width = width
    }
    if (typeof height === 'number' || typeof height === 'string') {
      query.height = height
    }
    return url.format({
      query: query,
      pathname: basePath + '/resize',
    })
  }
}
