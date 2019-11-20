'use strict'

var url = require('url')

module.exports = function(pathname, query = {}) {
  return url.format({
    query,
    pathname
  })
}
