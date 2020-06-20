import Keyv from 'keyv'
import { container } from 'tsyringe'
import { ImageAdapter } from './interfaces'
import { ObjectHash } from './object-hash.service'
import { Transformer } from './transformer.service'

class ImageMockAdapter implements ImageAdapter {
  // eslint-disable-next-line @typescript-eslint/require-await
  async fetch(id: string): Promise<Buffer | undefined> {
    return Buffer.from(`image: ${id}`)
  }
}

describe('Transformer', () => {
  describe('transform()', () => {
    let transformer: Transformer

    beforeEach(() => {
      transformer = new Transformer(container.resolve(ObjectHash), new Keyv())
    })

    it('throws an exception if the format can not be determined', async () => {
      expect.assertions(1)

      try {
        // @ts-ignore
        await transformer.transform('foo', {}, new ImageMockAdapter())
      } catch (error) {
        expect((error as Error).message).toBe(
          'Input buffer contains unsupported image format'
        )
      }
    })
  })
})
