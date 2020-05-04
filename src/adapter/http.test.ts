import { HttpAdapter } from './http'
import got from 'got'

jest.mock('got')

describe('HttpAdapter', () => {
  let adapter: HttpAdapter
  beforeEach(() => {
    adapter = new HttpAdapter({ prefixUrl: 'http://example.com/foo' })
  })

  test('constructor()', () => {
    expect(got.extend).toBeCalledWith({
      prefixUrl: 'http://example.com/foo',
    })
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      const image = await adapter.fetch('/foo/bar')
      expect(image?.toString()).toBe('test')

      // @ts-ignore
      expect(adapter.client.get).toBeCalledWith('foo/bar', {
        responseType: 'buffer',
      })
    })

    it('returns null on 404', async () => {
      const error = new Error() as any
      error.response = { statusCode: 404 }

      // @ts-ignore
      adapter.client.get.mockImplementation(() => {
        throw error
      })

      expect(await adapter.fetch('/foo/bar')).toBeNull()
    })

    it('re-throws other HTTP errors', async () => {
      expect.assertions(1)

      // @ts-ignore
      adapter.client.get.mockImplementation(() => {
        const error = new Error() as any
        error.response = { statusCode: 500 }
        throw error
      })

      try {
        await adapter.fetch('/foo/bar')
      } catch (error) {
        expect(error.response.statusCode).toBe(500)
      }
    })
  })
})
