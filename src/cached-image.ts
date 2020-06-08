import Keyv from 'keyv'
import { ImageAdapter } from './interfaces'
import { getLogger } from './logger'

export class CachedImage {
  log = getLogger('cached-image')

  constructor(
    private readonly cache: Keyv<Buffer>,
    private readonly adapter: ImageAdapter
  ) {}

  async fetch(id: string): Promise<Buffer | undefined> {
    const cacheKey = `image:${id}`

    let image = await this.cache.get(cacheKey)

    if (image) {
      this.log(`Serving original image ${cacheKey} from cache ...`)
      return image
    }

    image = await this.adapter.fetch(id)

    if (image) {
      this.log(`Caching original image ${id} ...`)
      await this.cache.set(cacheKey, image)
    }

    return image
  }
}
