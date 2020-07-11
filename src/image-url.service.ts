import { inject, injectable } from 'tsyringe'
import { URL } from 'url'
import { ConfigService } from './config.service'
import { QueryParams, Signer } from './interfaces'
import { ResizeDto } from './resize.dto'
import { UrlSigner } from './signed-url.service'

@injectable()
export class ImageUrl {
  constructor(
    @inject('endpoint') private readonly endpoint: string,
    @inject(UrlSigner) private readonly urlSigner: Signer,
    private readonly config: ConfigService
  ) {}

  private _buildUrl(
    imageId: string,
    params: Partial<Omit<ResizeDto, 'url'>>
  ): URL {
    const url = new URL(this.endpoint)

    // Endpoint w/ search params not supported
    url.search = ''

    url.pathname += imageId
    url.pathname = url.pathname.replace(/\/\/+/, '')

    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .sort()
      .forEach(([name, value]) => {
        url.searchParams.set(
          QueryParams[name as Exclude<keyof ResizeDto, 'url'>],

          // Type Guard in .filter() does not work:
          // > A type predicate cannot reference element 'value' in a binding
          // > pattern.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value!.toString()
        )
      })

    if (this.config.get('signedUrl.secret')) {
      this.urlSigner.sign(url)
    }

    return url
  }

  url(imageId: string, params: Partial<Omit<ResizeDto, 'url'>>): string {
    return this._buildUrl(imageId, params).toString()
  }

  pathQuery(imageId: string, params: Partial<Omit<ResizeDto, 'url'>>): string {
    const url = this._buildUrl(imageId, params)
    return url.pathname + url.search
  }
}
