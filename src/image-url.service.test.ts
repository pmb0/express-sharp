import { ImageUrl } from './image-url.service'
import { container } from 'tsyringe'
import { ConfigService } from './config.service'

describe('ImaegUrl', () => {
  let url: ImageUrl

  beforeEach(() => {
    container.register('endpoint', { useValue: 'http://example.com/base' })
    url = container.resolve(ImageUrl)
  })

  afterEach(() => {
    container.clearInstances()
  })

  describe('buildUrl()', () => {
    it('builds a valid image url', () => {
      expect(url.url('/bla/fasel.jpg', { width: 100, height: 300 })).toBe(
        'http://example.com/base/bla/fasel.jpg?h=300&w=100'
      )
    })

    it('signes URLs', () => {
      container.resolve(ConfigService).set('signedUrl.secret', 'foo')

      expect(url.url('/bla/fasel.jpg', { width: 100, height: 300 })).toBe(
        'http://example.com/base/bla/fasel.jpg?h=300&w=100&s=xE2D9Z8Q7DqksFiHeJSyJqGsnbKXTU8jcs-ucS8KdTc'
      )
    })

    it('filters undefined values', () => {
      expect(url.url('/bla/fasel.jpg', { width: 100, height: undefined })).toBe(
        'http://example.com/base/bla/fasel.jpg?w=100'
      )
    })
  })
})
