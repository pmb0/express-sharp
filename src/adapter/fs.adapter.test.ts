import { FsAdapter } from './fs.adapter'
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

      expect(fs.readFile).toHaveBeenCalledWith('/tmp/foo/bar')
    })

    it('returns undefined if the image does not exist', async () => {
      mocked(fs.readFile).mockImplementation(() => {
        const error = new Error() as any
        error.code = 'ENOENT'
        throw error
      })

      expect(await adapter.fetch('/foo/bar')).toBeUndefined()
    })

    it('re-throws other HTTP errors', async () => {
      // @ts-ignore
      mocked(fs.readFile).mockImplementation(() => {
        const error = new Error() as NodeJS.ErrnoException
        error.code = 'any other'
        throw error
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow(
        expect.objectContaining({ code: 'any other' }),
      )
    })
  })
})
