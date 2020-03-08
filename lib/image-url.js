const url = require('url')

// eslint-disable-next-line toplevel/no-toplevel-side-effect
module.exports = function(basePath) {
  return function(width, height, query) {
    let path = `${basePath}/resize/${width}`
    if (typeof query === 'undefined') {
      query = height
    } else {
      path += `/${height}`
    }

    return url.format({
      query: query,
      pathname: path,
    })
  }
}
