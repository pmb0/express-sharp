import { S3Adapter } from './s3.adapter'

const awsPromiseMock = jest
  .fn()
  .mockReturnValue({ Body: Buffer.from('mocked') })
const getObjectMock = jest.fn().mockReturnValue({ promise: awsPromiseMock })

jest.mock('aws-sdk', () => {
  class S3Mock {
    getObject = getObjectMock
  }

  return { S3: S3Mock }
})

describe('S3Adapter', () => {
  let adapter: S3Adapter

  beforeEach(() => {
    adapter = new S3Adapter('my-bucket')
  })

  describe('fetch()', () => {
    it('fetches the image', async () => {
      expect(await adapter.fetch('foo')).toEqual(Buffer.from('mocked'))

      expect(getObjectMock).toHaveBeenCalledWith({
        Bucket: 'my-bucket',
        Key: 'foo',
      })
    })

    it('does not find the image', async () => {
      awsPromiseMock.mockReturnValue({ Body: undefined })

      expect(await adapter.fetch('foo')).toBeUndefined()
    })

    it('catches errors', async () => {
      awsPromiseMock.mockRejectedValueOnce(new Error('ohoh'))
      // @ts-ignore
      const logSpy = jest.spyOn(adapter, 'log')

      expect(await adapter.fetch('foo')).toBeUndefined()
      expect(logSpy).toHaveBeenCalledWith('Fetching bucket "foo" failed: {}')
    })
  })
})
