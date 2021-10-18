import type { ExtendOptions, Got, RequestError } from 'got'
import { ImageAdapter } from '../interfaces'
import { getLogger } from '../logger'
import { optionalRequire } from '../optional-require'

export class HttpAdapter implements ImageAdapter {
  private client: Got
  private log = getLogger('adapter:http')

  constructor(gotOptions: ExtendOptions) {
    const got = optionalRequire<{ default: Got }>('got').default

    this.client = got.extend({
      ...gotOptions,
    })

    this.log(`Using prefixUrl: ${this.getPrefixUrl()}`)
  }

  private getPrefixUrl() {
    return this.client.defaults.options.prefixUrl
  }

  async fetch(url: string): Promise<Buffer | undefined> {
    this.log(`Fetching: ${this.getPrefixUrl()}${url}`)
    try {
      const response = await this.client.get(url, {
        responseType: 'buffer',
      })
      return response.body
    } catch (error) {
      // eslint-disable-next-line no-magic-numbers
      if ((error as RequestError).response?.statusCode === 404) {
        return undefined
      }

      throw error
    }
  }
}
