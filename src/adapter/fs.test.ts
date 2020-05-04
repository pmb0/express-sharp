import { FsAdapter } from './fs'
import { promises as fs } from 'fs'
import { mocked } from 'ts-jest/utils'

jest.mock('fs')

describe('FsAdapter', () => {
  let adapter: FsAdapter
  beforeEach(() => {
    adapter = new FsAdapter('/tmp')
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      // @ts-ignore
      fs.readFile.mockReturnValue('test')

      const image = await adapter.fetch('/foo/bar')
      expect(image?.toString()).toBe('test')

      expect(fs.readFile).toBeCalledWith('/tmp/foo/bar')
    })

    it('returns null if the image does not exist', async () => {
      mocked(fs.readFile).mockImplementation(() => {
        const error = new Error() as any
        error.code = 'ENOENT'
        throw error
      })

      expect(await adapter.fetch('/foo/bar')).toBeNull()
    })

    it('re-throws other HTTP errors', async () => {
      expect.assertions(1)

      // @ts-ignore
      mocked(fs.readFile).mockImplementation(() => {
        const error = new Error() as any
        error.code = 'any other'
        throw error
      })

      try {
        await adapter.fetch('/foo/bar')
      } catch (error) {
        expect(error.code).toBe('any other')
      }
    })
  })
})
