import type { S3 as S3Type } from 'aws-sdk'
import { ImageAdapter, Type } from '../interfaces'
import { getLogger } from '../logger'
import { optionalRequire } from '../optional-require'

export class S3Adapter implements ImageAdapter {
  private log = getLogger('adapter:s3')

  constructor(
    public readonly bucketName: string,
    private readonly s3client?: S3Type,
  ) {
    const { S3 } = optionalRequire<{ S3: Type<S3Type> }>('aws-sdk')
    this.s3client ??= new S3()

    this.log(`Using bucket name: ${bucketName}`)
  }

  async fetch(id: string): Promise<Buffer | undefined> {
    this.log(`Fetching image "${id}" from bucket "${this.bucketName}"`)
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const object = await this.s3client!.getObject({
        Bucket: this.bucketName,
        Key: id,
      }).promise()

      if (!Buffer.isBuffer(object.Body)) {
        return undefined
      }

      return object.Body
    } catch (error) {
      this.log(`Fetching bucket "${id}" failed: ${JSON.stringify(error)}`)
      return undefined
    }
  }
}
