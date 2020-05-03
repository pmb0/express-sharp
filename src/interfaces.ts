import { CorsOptions } from 'cors'
import Keyv from 'keyv'

export type format =
  | 'heic'
  | 'heif'
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'raw'
  | 'tiff'
  | 'webp'

export interface Result {
  // format: 'heic' | 'heif' | 'jpeg' | 'jpg' | 'png' | 'raw' | 'tiff' | 'webp'
  format: format
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
