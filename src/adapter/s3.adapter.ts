import { S3 } from 'aws-sdk'
import { ImageAdapter } from '../interfaces'
import { getLogger } from '../logger'

export class S3Adapter implements ImageAdapter {
  private log = getLogger('adapter:s3')

  constructor(
    public readonly bucketName: string,
    private readonly s3client = new S3(),
  ) {
    this.log(`Using bucket name: ${bucketName}`)
  }

  async fetch(id: string): Promise<Buffer | undefined> {
    this.log(`Fetching image "${id}" from bucket "${this.bucketName}"`)
    try {
      const object = await this.s3client
        .getObject({ Bucket: this.bucketName, Key: id })
        .promise()

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
