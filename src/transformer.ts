import { ImageAdapter, Result } from './interfaces'
import ResizeDto from './resize.dto'
import sharp from 'sharp'
import { getLogger } from './logger'
import Keyv from 'keyv'

const DEFAULT_CROP_MAX_SIZE = 2000

export class Transformer {
  log = getLogger('transformer')
  cropMaxSize = DEFAULT_CROP_MAX_SIZE

  constructor(private imageAdapter: ImageAdapter, private cache = new Keyv()) {}

  getCropDimensions(maxSize: number, width: number, height?: number) {
    height = height || width
    if (width <= maxSize && height <= maxSize) return [width, height]
    const aspectRatio = width / height
    if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
    return [maxSize * aspectRatio, maxSize]
  }

  // TODO: Refactor
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  async transform(id: string, options: ResizeDto): Promise<Result> {
    const cachedImage = await this.cache.get(`transform:${id}`)
    if (cachedImage) {
      return cachedImage
    }

    this.log(`Resizing ${id} with options:`, options)

    const originalImage = await this.imageAdapter.fetch(id)

    if (!originalImage) {
      return {
        image: null,
        format: options.format || '',
      }
    }

    const transformer = sharp(originalImage)

    options.format = options.format || (await transformer.metadata()).format

    if (!options.format) {
      throw new Error('Unknown format')
    }

    if (options.crop) {
      const [cropWidth, cropHeight] = this.getCropDimensions(
        this.cropMaxSize,
        options.width,
        options.height
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

    const image = await transformer
      .toFormat(options.format, {
        quality: options.quality,
        progressive: options.progressive,
      })
      .toBuffer()

    this.log('Resizing done')

    const result = { image, format: options.format }
    this.cache.set(`transform:${id}`, result)
    return result
  }
}
