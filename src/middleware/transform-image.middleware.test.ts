import Keyv from 'keyv'
import { container } from 'tsyringe'
import { Transformer } from '../transformer.service'
import { transformImage } from './transform-image.middleware'

describe('transformImage', () => {
  container.registerInstance('imageAdapter', { useValue: null })
  container.register(Keyv, { useValue: new Keyv() })

  const next = jest.fn()
  const transformer = container.resolve(Transformer)
  const transformSpy = jest.spyOn(transformer, 'transform').mockImplementation()

  afterEach(() => {
    next.mockClear()
    transformSpy.mockClear()
  })

  it('renders the next middleware (aka 404) if no image is returned', async () => {
    const response = {
      locals: { dto: { url: 'http://example.com/foo.png' } },
    }

    transformSpy.mockResolvedValue({ format: 'jpeg', image: null })

    // @ts-ignore
    await transformImage({}, response, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('sends the transformed image', async () => {
    const response = {
      locals: { dto: { url: 'http://example.com/foo.png' } },
      send: jest.fn(),
      type: jest.fn(),
    }

    const image = Buffer.from('image mock')

    transformSpy.mockResolvedValue({ format: 'jpeg', image })

    // @ts-ignore
    await transformImage({}, response, next)

    expect(next).not.toHaveBeenCalled()
    expect(response.type).toHaveBeenCalledWith('image/jpeg')
    expect(response.send).toHaveBeenCalledWith(image)
  })

  it('calls the next error middleware on error', async () => {
    transformSpy.mockImplementation(() => {
      throw new Error('ohoh')
    })

    await transformImage(
      // @ts-ignore
      {},
      { locals: { dto: { url: 'http://example.com/foo.png' } } },
      next,
    )

    expect(next).toHaveBeenCalledWith(new Error('ohoh'))
  })

  it('throws an error if the image url is missing', async () => {
    await transformImage(
      // @ts-ignore
      {},
      { locals: { dto: {} } },
      next,
    )

    expect(next).toHaveBeenCalledWith(new Error('Image url missing'))
  })
})
