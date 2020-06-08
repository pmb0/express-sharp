import { container } from 'tsyringe'
import { ConfigService } from './config.service'
import { UrlSigner } from './signed-url.service'

describe('URLSigner', () => {
  let config: ConfigService
  let signer: UrlSigner

  beforeEach(() => {
    config = container.resolve(ConfigService)
    signer = container.resolve(UrlSigner)
  })

  afterEach(() => {
    container.clearInstances()
  })

  test('sign()', () => {
    config.set('signedUrl.secret', 'foo')
    config.set('signedUrl.paramName', 'bar')

    expect(signer.sign('https://example.com/?foo=bar')).toBe(
      'https://example.com/?foo=bar&bar=MCv4YIAKZv0bxQBmTnwGrU6GjT8bRUmsW9rhVtkMyIk'
    )
  })

  describe('verify()', () => {
    beforeEach(() => {
      config.set('signedUrl.secret', 'foo')
      config.set('signedUrl.paramName', 'bar')
    })

    it('detects a valid signature', () => {
      expect(
        signer.verify(
          'https://example.com/?foo=bar&bar=MCv4YIAKZv0bxQBmTnwGrU6GjT8bRUmsW9rhVtkMyIk'
        )
      ).toBeTruthy()
    })

    it('detects an invalid signature', () => {
      expect(
        signer.verify(
          'https://example.com/?foo=bar&additional-param&bar=MCv4YIAKZv0bxQBmTnwGrU6GjT8bRUmsW9rhVtkMyIk'
        )
      ).toBeFalsy()
    })

    it('accepts an URL object', () => {
      expect(() => {
        signer.verify(new URL('https://example.com/foo.png'))
      }).not.toThrow()
    })

    it('throws an error if no secret is configured', () => {
      config.set('signedUrl.secret', '')
      expect(() => {
        signer.verify('https://example.com/?foo=bar&bar=whatever')
      }).toThrow(
        new Error(
          'Secret is missing. Please set EXPRESS_SHARP_SIGNED_URL_SECRET'
        )
      )
    })
  })
})
