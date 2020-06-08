import cors from 'cors'
import { NextFunction, Request, Response, Router } from 'express'
import Keyv from 'keyv'
import { container } from 'tsyringe'
import { ExpressSharpOptions } from '../interfaces'
import { ResizeDto } from '../resize.dto'
import { Transformer } from '../transformer.service'
import { etagCaching } from './etag-caching.middleware'
import { signedUrl } from './signed-url.middleware'
import { transformQueryParams } from './transform-query-params.middleware'
import { useWebpIfSupported } from './use-webp-if-supported.middleware'
import { validate } from './validator.middleware'

export async function getImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { dto } = res.locals

  try {
    const { format, image } = await container
      .resolve(Transformer)
      .transform(dto.url, dto)

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

export function expressSharp(options: ExpressSharpOptions) {
  options.autoUseWebp = options.autoUseWebp ?? true

  const middlewares = [
    transformQueryParams,
    validate<ResizeDto>(ResizeDto),
    cors(options.cors),
    useWebpIfSupported,
    etagCaching,
  ]

  if (options.secret) middlewares.push(signedUrl)

  container.register<Keyv>(Keyv, { useValue: options.cache || new Keyv() })
  container.registerInstance('imageAdapter', options.imageAdapter)

  const router = Router()
  router.get('/:url', ...middlewares, getImage)
  return router
}
