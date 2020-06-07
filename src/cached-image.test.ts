import Keyv from 'keyv'
import { CachedImage } from './cached-image'
import { ImageAdapter } from './interfaces'

class ImageAdapterMock implements ImageAdapter {
  fetchMock: Buffer | undefined = undefined

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

    cachedImage = new CachedImage(new Keyv({ store: cache }), adapter)
  })

  describe('fetch()', () => {
    it('stores the image in the cache', async () => {
      expect(await cachedImage.fetch('abc')).toBeNull()

      adapter.fetchMock = Buffer.from('foo')
      expect((await cachedImage.fetch('def')).toString()).toBe('foo')

      expect(cache).toMatchInlineSnapshot(`
        Map {
          "keyv:image:abc" => "{\\"value\\":null,\\"expires\\":null}",
          "keyv:image:def" => "{\\"value\\":\\":base64:Zm9v\\",\\"expires\\":null}",
        }
      `)
    })

    it.only('serves the image from cache', async () => {
      // @ts-ignore
      await cachedImage.cache.set('image:foo', 'bar')

      expect((await cachedImage.fetch('foo')).toString()).toBe('bar')
    })
  })
})
