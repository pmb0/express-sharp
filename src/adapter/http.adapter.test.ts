import { HttpAdapter } from './http.adapter'
import got from 'got'

jest.mock('got')

describe('HttpAdapter', () => {
  let adapter: HttpAdapter
  beforeEach(() => {
    adapter = new HttpAdapter({ prefixUrl: 'http://example.com/foo' })
  })

  test('constructor()', () => {
    expect(got.extend).toHaveBeenCalledWith({
      prefixUrl: 'http://example.com/foo',
    })
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      const image = await adapter.fetch('/foo/bar')
      expect(image?.toString()).toBe('test')

      // @ts-ignore
      expect(adapter.client.get).toHaveBeenCalledWith('/foo/bar', {
        responseType: 'buffer',
      })
    })

    it('returns undefined on 404', async () => {
      const error = new Error() as any
      error.response = { statusCode: 404 }

      // @ts-ignore
      adapter.client.get.mockImplementation(() => {
        throw error
      })

      expect(await adapter.fetch('/foo/bar')).toBeUndefined()
    })

    it('re-throws other HTTP errors', async () => {
      // @ts-ignore
      adapter.client.get.mockImplementation(() => {
        const error = new Error() as any
        error.response = { statusCode: 500 }
        throw error
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow(
        expect.objectContaining({
          response: { statusCode: 500 },
        })
      )
    })

    it('re-throws other errors', async () => {
      // @ts-ignore
      adapter.client.get.mockImplementation(() => {
        throw new Error('ohoh')
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow('ohoh')
    })
  })
})
