import { Router } from 'express'
import Keyv from 'keyv'
import { container } from 'tsyringe'
import { HttpAdapter } from '../adapter'
import { ConfigService } from '../config.service'
import { Transformer } from '../transformer.service'
import { expressSharp } from './express-sharp.middleware'
import { signedUrl } from './signed-url.middleware'
import { useWebpIfSupported } from './use-webp-if-supported.middleware'

function getMiddlewaresFromRouter(router: Router): any[] {
  return router.stack[0].route.stack.map((layer: any) => layer.handle)
}

describe('expressSharp', () => {
  container.resolve(ConfigService).set('signedUrl.secret', 'test')
  container.register('imageAdapter', { useValue: {} })
  container.register(Keyv, { useValue: new Keyv() })

  const next = jest.fn()
  const transformer = container.resolve(Transformer)
  const transformSpy = jest.spyOn(transformer, 'transform').mockImplementation()

  afterEach(() => {
    next.mockClear()
    transformSpy.mockClear()
  })

  describe('expressSharp()', () => {
    const imageAdapter = new HttpAdapter({})

    describe('signed url', () => {
      let router: Router

      beforeEach(() => {
        router = expressSharp({ imageAdapter, secret: 'foo' })
      })

      it('sets the secret', () => {
        expect(container.resolve(ConfigService).get('signedUrl.secret')).toBe(
          'foo'
        )
      })

      it('uses the signed url feature', () => {
        expect(getMiddlewaresFromRouter(router)).toContain(signedUrl)
      })
    })

    describe('auto-use webp', () => {
      it('is used', () => {
        const router = expressSharp({ imageAdapter, autoUseWebp: true })
        expect(getMiddlewaresFromRouter(router)).toContain(useWebpIfSupported)
      })

      it('is not used', () => {
        const router = expressSharp({ imageAdapter, autoUseWebp: false })
        expect(getMiddlewaresFromRouter(router)).not.toContain(
          useWebpIfSupported
        )
      })
    })

    describe('Cache', () => {
      it('uses the cache instance', () => {
        const cache = new Keyv({ namespace: 'foo' })

        expressSharp({ imageAdapter, cache })
        expect(container.resolve(Keyv)).toBe(cache)
      })

      it('uses the default cache', () => {
        expressSharp({ imageAdapter })
        expect(container.resolve(Keyv)).toBeDefined()
      })
    })
  })
})
