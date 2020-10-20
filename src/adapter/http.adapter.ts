import { ImageAdapter } from '../interfaces'
import got, { Got, ExtendOptions, RequestError } from 'got'
import { getLogger } from '../logger'

export class HttpAdapter implements ImageAdapter {
  private client: Got
  private log = getLogger('adapter:http')

  constructor(gotOptions: ExtendOptions) {
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
