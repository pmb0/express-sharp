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
  let transformer: Transformer

  beforeEach(() => {
    transformer = new Transformer(container.resolve(ObjectHash), new Keyv())
  })

  describe('getCropDimensions()', () => {
    test('width <= maxSize && height <= maxSize', () => {
      expect(transformer.getCropDimensions(300, 100, 200)).toEqual([100, 200])
    })

    test('width > height', () => {
      expect(transformer.getCropDimensions(100, 300, 200)).toEqual([100, 67])
    })

    test('other cases', () => {
      expect(transformer.getCropDimensions(100, 300, 400)).toEqual([75, 100])
    })

    test('height defaults to width', () => {
      expect(transformer.getCropDimensions(200, 300)).toEqual([200, 200])
    })
  })

  describe('transform()', () => {
    it('throws an exception if the format can not be determined', async () => {
      await expect(
        // @ts-ignore
        () => transformer.transform('foo', {}, new ImageMockAdapter()),
      ).rejects.toThrow(
        new Error('Input buffer contains unsupported image format'),
      )
    })
  })
})
