const sharp = require('sharp')

const cropDimensions = (width, height, maxSize) => {
  if (width <= maxSize && height <= maxSize) return [width, height]
  const aspectRatio = width / height
  if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
  return [maxSize * aspectRatio, maxSize]
}

module.exports = (image,
  {
    width,
    height,
    crop = false,
    cropMaxSize = 2000,
    gravity = sharp.gravity.center,
    format = sharp.format.jpeg.id,
    progressive = true,
    quality = 80
  } = {}) =>
  sharp(image)
    .resize(...cropDimensions(width, height, cropMaxSize), {
      fit: crop ? 'cover' : 'outside',
      gravity
    })[format]({
      quality,
      progressive
    })
