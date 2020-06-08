import { ImageUrl } from './image-url.service'
import { container } from 'tsyringe'
import { ConfigService } from './config.service'

describe('ImaegUrl', () => {
  test('buildUrl', () => {
    container.register('endpoint', { useValue: 'http://example.com/base' })

    const url = container.resolve(ImageUrl)

    expect(url.url('/bla/fasel.jpg', { width: 100, height: 300 })).toBe(
      'http://example.com/base/bla/fasel.jpg?h=300&w=100'
    )

    container.resolve(ConfigService).set('signedUrl.secret', 'foo')
    expect(url.url('/bla/fasel.jpg', { width: 100, height: 300 })).toBe(
      'http://example.com/base/bla/fasel.jpg?h=300&w=100&s=xE2D9Z8Q7DqksFiHeJSyJqGsnbKXTU8jcs-ucS8KdTc'
    )
  })
})
