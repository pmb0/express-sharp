import crypto from 'crypto'
import { injectable } from 'tsyringe'
import { URL } from 'url'
import { ConfigService } from './config.service'

@injectable()
export class UrlSigner {
  constructor(private readonly config: ConfigService) {}

  private makeUrlSafe(string: string) {
    return string.replace(/[+/_]/g, '-').replace(/=/g, '')
  }

  private getSignature(string: string): string {
    const secret = this.config.get('signedUrl.secret')
    if (!secret) {
      throw new TypeError(
        `Secret is missing. Please set ${ConfigService.GLOBAL_PREFIX}SIGNED_URL_SECRET`
      )
    }

    return this.makeUrlSafe(
      crypto
        .createHmac(this.config.get('signedUrl.algorithm', 'sha256')!, secret)
        .update(string)
        .digest('base64')
    )
  }

  private getParamName(): string {
    return this.config.get('signedUrl.paramName', 's') as string
  }

  sign(url: string | URL): string {
    if (typeof url === 'string') url = new URL(url)

    url.searchParams.set(this.getParamName(), this.getSignature(url.toString()))
    return url.toString()
  }

  verify(url: string | URL): boolean {
    if (typeof url === 'string') url = new URL(url)

    const signature = url.searchParams.get(this.getParamName())
    url.searchParams.delete(this.getParamName())

    return this.getSignature(url.toString()) === signature
  }
}
