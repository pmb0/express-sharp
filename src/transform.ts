import sharp, { bool, FormatEnum, Gravity } from 'sharp'
import ResizeDto from './resize.dto'

const cropDimensions = (width: number, height: number, maxSize: number) => {
  if (width <= maxSize && height <= maxSize) return [width, height]
  const aspectRatio = width / height
  if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
  return [maxSize * aspectRatio, maxSize]
}

const DEFAULT_CROP_MAX_SIZE = 2000

// eslint-disable-next-line toplevel/no-toplevel-side-effect
export default async (image: Buffer, options: ResizeDto) => {
  const transformer = sharp(image)

  options.format = options.format || (await transformer.metadata()).format

  if (options.crop) {
    const [cropWidth, cropHeight] = cropDimensions(
      options.width,
      options.height,
      DEFAULT_CROP_MAX_SIZE
    )
    transformer.resize(cropWidth, cropHeight, {
      position: options.gravity,
    })
  } else {
    transformer.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  const buffer = await transformer
    .toFormat(options.format, {
      quality: options.quality,
      progressive: options.progressive,
    })
    .toBuffer()
  return { buffer, format: options.format }
}
