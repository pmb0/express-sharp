import { ImageAdapter } from './interfaces'
import { Transformer } from './transformer.service'
import Keyv from 'keyv'

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
      transformer = new Transformer(new ImageMockAdapter(), new Keyv())
    })

    it('throws an exception if the format can not be determined', async () => {
      expect.assertions(1)

      try {
        // @ts-ignore
        await transformer.transform('foo', {})
      } catch (error) {
        expect((error as Error).message).toBe(
          'Input buffer contains unsupported image format'
        )
      }
    })
  })
})
