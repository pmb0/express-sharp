import { Router } from 'express'
import Keyv from 'keyv'
import { container } from 'tsyringe'
import { HttpAdapter } from '../adapter'
import { ConfigService } from '../config.service'
import { Transformer } from '../transformer.service'
import { expressSharp, getImage } from './express-sharp.middleware'
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

  describe('getImage()', () => {
    it('renders the next middleware (aka 404) if no image is returned', async () => {
      const response = {
        locals: { dto: { url: 'http://example.com/foo.png' } },
      }

      transformSpy.mockResolvedValue({ format: 'jpeg', image: null })

      // @ts-ignore
      await getImage({}, response, next)

      expect(next).toBeCalledWith()
    })

    it('sends the transformed iamge', async () => {
      const response = {
        locals: { dto: { url: 'http://example.com/foo.png' } },
        type: jest.fn(),
        send: jest.fn(),
      }

      const image = Buffer.from('image mock')

      transformSpy.mockResolvedValue({ format: 'jpeg', image })

      // @ts-ignore
      await getImage({}, response, next)

      expect(next).not.toBeCalled()
      expect(response.type).toBeCalledWith('image/jpeg')
      expect(response.send).toBeCalledWith(image)
    })

    it('calls the next error middleware on error', async () => {
      transformSpy.mockImplementation(async () => {
        throw new Error('ohoh')
      })

      // @ts-ignore
      await getImage({}, { locals: { dto: {} } }, next)

      expect(next).toBeCalledWith(new Error('ohoh'))
    })
  })

  describe('expressSharp()', () => {
    const imageAdapter = new HttpAdapter({})

    it('uses the cache imageAdapter', () => {
      expressSharp({ imageAdapter })
      expect(container.resolve('imageAdapter')).toBe(imageAdapter)
    })

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
