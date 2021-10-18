import { CorsOptions } from 'cors'
import Keyv from 'keyv'

export type format = 'heif' | 'jpeg' | 'jpg' | 'png' | 'raw' | 'tiff' | 'webp'

export interface Result {
  // format: 'heic' | 'heif' | 'jpeg' | 'jpg' | 'png' | 'raw' | 'tiff' | 'webp'
  format: format | undefined
  image: Buffer | null
}

export interface ImageAdapter {
  fetch(id: string): Promise<Buffer | undefined>
}

export interface ExpressSharpOptions {
  autoUseWebp?: boolean
  cors?: CorsOptions
  imageAdapter: ImageAdapter
  cache?: Keyv
  secret?: string
}

export enum QueryParams {
  quality = 'q',
  width = 'w',
  height = 'h',
  format = 'f',
  progressive = 'p',
  crop = 'c',
  gravity = 'g',
}

export interface Signer {
  sign(string: string | URL): string
  verify(string: string): boolean
}

export interface Type<T = unknown> extends Function {
  new (...args: unknown[]): T
}
