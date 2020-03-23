/* eslint-disable toplevel/no-toplevel-side-effect */
import { FsAdapter } from './fs'
import { promises as fs } from 'fs'

jest.mock('fs')

describe('FsAdapter', () => {
  let adapter: FsAdapter
  beforeEach(() => {
    adapter = new FsAdapter('/tmp')
  })

  test('fetch', async () => {
    // @ts-ignore
    fs.readFile.mockReturnValue('test')

    const image = await adapter.fetch('/foo/bar')
    expect(image?.toString()).toBe('test')

    expect(fs.readFile).toBeCalledWith('/tmp/foo/bar')
  })
})
