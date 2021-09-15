import Keyv from 'keyv'
import { ImageAdapter } from '../../core/src/interfaces'
import { CachedImage } from './cached-image'

class ImageAdapterMock implements ImageAdapter {
  fetchMock: Buffer | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async fetch(id: string): Promise<Buffer | undefined> {
    return this.fetchMock
  }
}

describe('CachedImage', () => {
  let cachedImage: CachedImage
  let adapter: ImageAdapterMock
  let cache: Map<string, Buffer>

  beforeEach(() => {
    adapter = new ImageAdapterMock()
    cache = new Map()

    cachedImage = new CachedImage(new Keyv({ store: cache }))
  })

  describe('fetch()', () => {
    it('stores the image in the cache', async () => {
      expect(await cachedImage.fetch('abc', adapter)).toBeUndefined()

      adapter.fetchMock = Buffer.from('foo')
      expect((await cachedImage.fetch('def', adapter))?.toString()).toBe('foo')

      expect(cache).toMatchInlineSnapshot(`
        Map {
          "keyv:image:def" => "{\\"value\\":\\":base64:Zm9v\\",\\"expires\\":null}",
        }
      `)
    })

    it('serves the image from cache', async () => {
      // @ts-ignore
      await cachedImage.cache.set('image:foo', 'bar')

      expect((await cachedImage.fetch('foo', adapter))?.toString()).toBe('bar')
    })
  })
})
