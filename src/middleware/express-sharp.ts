import { etagCaching } from './etag-caching'
import { ExpressSharpOptions } from '../interfaces'
import { Request, Response, Router, NextFunction } from 'express'
import { Transformer } from '../transformer'
import { validate } from './validator'
import cors from 'cors'
import ResizeDto from '../resize.dto'

export function expressSharp(options: ExpressSharpOptions) {
  options.autoUseWebp = options.autoUseWebp ?? true

  const router = Router()

  router.get(
    '/resize/:width/:height?',
    validate(ResizeDto),
    cors(options.cors),
    etagCaching,
    async (req: Request, res: Response, next: NextFunction) => {
      const { dto } = res.locals

      if (options.autoUseWebp && req.headers.accept?.includes('image/webp'))
        dto.format = 'webp'

      const transformer = new Transformer(options.imageAdapter, options.cache)

      try {
        const { format, image } = await transformer.transform(dto.url, dto)

        if (!image) {
          next()
          return
        }

        // TODO: Cache-Control, Last-Modified
        res.type(`image/${format}`)
        res.send(image)
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}
