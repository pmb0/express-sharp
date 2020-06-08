import { container } from 'tsyringe'
import { ConfigService } from './config.service'
import { UrlSigner } from './signed-url.service.service'

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

  test('verify()', () => {
    config.set('signedUrl.secret', 'foo')
    config.set('signedUrl.paramName', 'bar')

    expect(
      signer.verify(
        'https://example.com/?foo=bar&bar=MCv4YIAKZv0bxQBmTnwGrU6GjT8bRUmsW9rhVtkMyIk'
      )
    ).toBeTruthy()

    expect(
      signer.verify(
        'https://example.com/?foo=bar&additional-param&bar=MCv4YIAKZv0bxQBmTnwGrU6GjT8bRUmsW9rhVtkMyIk'
      )
    ).toBeFalsy()
  })
})
