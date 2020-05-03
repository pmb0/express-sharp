/* eslint-disable toplevel/no-toplevel-side-effect */
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
      // cache: {
      //   _size: 0,
      //   cache: expect.any(Map),
      //   maxSize: 50,
      //   oldCache: expect.any(Map),
      // },
      prefixUrl: 'http://example.com/foo',
    })
  })

  test('fetch()', async () => {
    const image = await adapter.fetch('/foo/bar')
    expect(image?.toString()).toBe('test')

    // @ts-ignore
    expect(adapter.client.get).toBeCalledWith('foo/bar', {
      responseType: 'buffer',
    })
  })
})
