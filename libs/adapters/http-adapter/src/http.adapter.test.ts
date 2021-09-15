import {
  axios,
  mockNextResponse,
  mockNextResponseAsError,
  setAxiosConfig,
} from '@edged/testing'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import httpStatus from 'http-status'
import { HttpAdapter } from './http.adapter'

const axiosConfig: AxiosRequestConfig = { baseURL: 'http://example.com/foo' }
setAxiosConfig(axiosConfig)

describe('HttpAdapter', () => {
  let adapter: HttpAdapter

  beforeEach(() => {
    adapter = new HttpAdapter(axiosConfig)
  })

  test('constructor()', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://example.com/foo',
    })
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      mockNextResponse(Buffer.from('test'))

      const image = await adapter.fetch('/foo/bar')
      expect(image?.toString()).toBe('test')

      expect(axios.get).toHaveBeenCalledWith('/foo/bar', {
        responseType: 'arraybuffer',
      })
    })

    it('returns undefined on 404', async () => {
      mockNextResponseAsError('error', 'ohoh', undefined, httpStatus.NOT_FOUND)

      expect(await adapter.fetch('/foo/bar')).toBeUndefined()
    })

    it('re-throws other HTTP errors', async () => {
      mockNextResponseAsError(
        'error',
        'ohoh',
        undefined,
        httpStatus.BAD_GATEWAY,
      )

      await expect(() => adapter.fetch('/foo/bar')).rejects.toMatchObject<{
        response: Partial<AxiosResponse>
      }>({
        response: { status: httpStatus.BAD_GATEWAY },
      })
    })

    it('re-throws other errors', async () => {
      axios.get.mockImplementation(() => {
        throw new Error('some other error')
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow(
        'some other error',
      )
    })
  })
})
