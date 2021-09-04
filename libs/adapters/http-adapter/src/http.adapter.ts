import { getLogger, ImageAdapter } from '@edged/core'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import httpStatus from 'http-status'
export class HttpAdapter implements ImageAdapter {
  private client: AxiosInstance
  private log = getLogger('adapter:http')

  constructor(axiosOptions: AxiosRequestConfig) {
    this.client = axios.create({
      ...axiosOptions,
    })
  }

  async fetch(url: string): Promise<Buffer | undefined> {
    this.log(`Fetching: ${this.client.getUri()}`)
    try {
      const response = await this.client.get<Buffer>(url, {
        responseType: 'arraybuffer',
      })
      return response.data
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === httpStatus.NOT_FOUND
      ) {
        return undefined
      }

      throw error
    }
  }
}
