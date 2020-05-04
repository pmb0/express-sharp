import { ImageAdapter, Result, format } from './interfaces'
import ResizeDto from './resize.dto'
import sharp from 'sharp'
import { getLogger } from './logger'
import Keyv from 'keyv'
import crypto from 'crypto'
import { CachedImage } from './cached-image'

const DEFAULT_CROP_MAX_SIZE = 2000
const CACHE_KEY_HASH_LENGTH = 10

export class Transformer {
  log = getLogger('transformer')
  cropMaxSize = DEFAULT_CROP_MAX_SIZE

  constructor(
    private readonly imageAdapter: ImageAdapter,
    private readonly cache = new Keyv(),
    private readonly cachedImage = new CachedImage(cache, imageAdapter)
  ) {}

  getCropDimensions(maxSize: number, width: number, height?: number) {
    height = height || width
    if (width <= maxSize && height <= maxSize) return [width, height]
    const aspectRatio = width / height
    if (width > height) return [maxSize, Math.round(maxSize / aspectRatio)]
    return [maxSize * aspectRatio, maxSize]
  }

  buildCacheKey(id: string, options: ResizeDto): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(options, Object.keys(options).sort()))
      .digest('hex')
      .slice(0, CACHE_KEY_HASH_LENGTH)
    return `transform:${id}:${this.imageAdapter.constructor.name}:${hash}`
  }

  // TODO: Refactor
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  async transform(id: string, options: ResizeDto): Promise<Result> {
    const cacheKey = this.buildCacheKey(id, options)

    const cachedImage = await this.cache.get(cacheKey)
    if (cachedImage) {
      this.log(`Serving ${id} from cache ...`)
      return cachedImage
    }

    this.log(`Resizing ${id} with options:`, options)

    const originalImage = await this.cachedImage.fetch(id)

    if (!originalImage) {
      return {
        image: null,
        format: options.format! || '',
      }
    }

    const transformer = sharp(originalImage)

    if (!options.format)
      options.format = (await transformer.metadata()).format as format

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

    this.log(`Caching ${cacheKey} ...`)
    this.cache.set(cacheKey, result)
    return result
  }
}
