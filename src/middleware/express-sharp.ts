import cors from 'cors'
import { NextFunction, Request, Response, Router } from 'express'
import { ExpressSharpOptions } from '../interfaces'
import { ResizeDto } from '../resize.dto'
import { Transformer } from '../transformer'
import { etagCaching } from './etag-caching'
import { transformQueryParams } from './transform-query-params'
import { useWebpIfSupported } from './use-webp-if-supported'
import { validate } from './validator'

export function expressSharp(options: ExpressSharpOptions) {
  options.autoUseWebp = options.autoUseWebp ?? true

  const middlewares = [
    transformQueryParams,
    validate<ResizeDto>(ResizeDto),
    cors(options.cors),
    useWebpIfSupported,
    etagCaching,
  ]

  const router = Router()

  router.get(
    '/:url',
    ...middlewares,
    async (req: Request, res: Response, next: NextFunction) => {
      const { dto } = res.locals
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
