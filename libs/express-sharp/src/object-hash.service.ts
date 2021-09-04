import { ConfigService } from '@edged/config'
import crypto from 'crypto'
import { injectable } from 'tsyringe'

@injectable()
export class ObjectHash {
  constructor(private readonly config: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  stringify(object: any): string {
    return JSON.stringify(object, Object.keys(object).sort())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  hash(object: any): string {
    return crypto
      .createHash(this.config.get('objectHash.alogorithm', 'sha256'))
      .update(this.stringify(object))
      .digest('hex')
      .slice(0, parseInt(this.config.get('objectHash.hashLength', '10'), 10))
  }
}
