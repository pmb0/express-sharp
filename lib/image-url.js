'use strict'

var url = require('url')

module.exports = function(basePath) {
  return function(width, height, query) {
    var path = basePath + '/resize/' + width
    if (typeof query === 'undefined') {
      query = height
    } else {
      path += '/' + height
    }
    return url.format({
      query: query,
      pathname: path,
    })
  }
}
