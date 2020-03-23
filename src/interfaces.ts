import { CorsOptions } from 'cors'
import Keyv from 'keyv'

export interface Result {
  // format: 'heic' | 'heif' | 'jpeg' | 'jpg' | 'png' | 'raw' | 'tiff' | 'webp'
  format: string
  image: Buffer | null
}

export interface ImageAdapter {
  fetch(id: string): Promise<Buffer | null>
}

export interface ExpressSharpOptions {
  autoUseWebp?: boolean
  cors?: CorsOptions
  imageAdapter: ImageAdapter
  cache?: Keyv<any>
}

// export interface Logger {
//   debug(message: string): void
//   info(message: string): void
//   warn(message: string): void
//   error(message: string): void
// }

// export interface Cachable {}
