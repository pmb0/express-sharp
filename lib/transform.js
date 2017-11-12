const sharp = require('sharp')

const cropDimensions = (width, height, maxSize) => {
  if (width <= maxSize && height <= maxSize) return [width, height]
  const aspectRatio = width / height
  if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
  return [maxSize * aspectRatio, maxSize]
}

module.exports = (image, {
  width,
  height,
  crop = false,
  cropMaxSize,
  gravity = sharp.gravity.center,
  format = sharp.format.jpeg.id,
  progressive = true,
  quality = 80,
} = {}) => {
  const transformer = sharp(image)

  if (crop) {
    transformer.resize(...cropDimensions(width, height, cropMaxSize)).crop(gravity)
  } else {
    transformer.resize(width, height).min().withoutEnlargement()
  }

  return transformer[format]({quality, progressive}).toBuffer()
}
