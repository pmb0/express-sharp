const sharp = require('sharp')

const cropDimensions = (width, height, maxSize) => {
  if (width <= maxSize && height <= maxSize) return [width, height]
  const aspectRatio = width / height
  if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
  return [maxSize * aspectRatio, maxSize]
}

const DEFAULT_QUALITY = 80

// eslint-disable-next-line toplevel/no-toplevel-side-effect
module.exports = (
  image,
  {
    width,
    height,
    crop = false,
    cropMaxSize,
    gravity = 'center',
    format = sharp.format.jpeg.id,
    progressive = true,
    quality = DEFAULT_QUALITY,
  } = {}
) => {
  const transformer = sharp(image)

  if (crop) {
    transformer.resize(...cropDimensions(width, height, cropMaxSize), {
      position: gravity,
    })
  } else {
    transformer.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  return transformer.toFormat(format, { quality, progressive }).toBuffer()
}
